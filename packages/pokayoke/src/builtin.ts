import { definePreset, defineRule } from "./define";

const noFindings = async () => ({ findings: [] });

type MaxFileLinesOptions = {
  max?: number;
  ignore?: string[];
};

const maxFileLinesId = "structure/max-file-lines";
const noUnusedSuppressionsId = "suppressions/no-unused";
const knipAdapterId = "adapter/knip";
const biomeAdapterId = "adapter/biome";

type AdapterOptions = {
  command?: string;
  args?: string[];
};

export const maxFileLines = defineRule({
  meta: {
    id: maxFileLinesId,
    docs: "Keep files under a configured line limit unless an explicit exception applies.",
    kind: "project",
  },
  async run(context) {
    const options = (context.options ?? {}) as MaxFileLinesOptions;
    const max = options.max ?? 350;
    const ignores = (options.ignore ?? []).map((pattern) => new Bun.Glob(pattern));
    const findings = [];

    for (const file of await context.files()) {
      if (ignores.some((ignore) => ignore.match(file))) {
        continue;
      }

      const lineCount = countLines(await context.readFile(file));

      if (lineCount > max) {
        findings.push({
          ruleId: maxFileLinesId,
          severity: "warn" as const,
          message: `File has ${lineCount} lines, above the configured maximum of ${max}.`,
          file,
          line: max + 1,
          advice: "Split the file or add a narrow rule-level ignore if the size is intentional.",
        });
      }
    }

    return { findings };
  },
});

export const noUnusedSuppressions = defineRule({
  meta: {
    id: noUnusedSuppressionsId,
    docs: "Report suppression comments that no longer suppress an active finding.",
    kind: "project",
  },
  run: noFindings,
});

const knipAdapter = defineRule({
  meta: {
    id: knipAdapterId,
    docs: "Run Knip and surface unused dependency, export, and file findings through pokayoke.",
    kind: "adapter",
  },
  async run(context) {
    return runAdapter(context, knipAdapterId, {
      command: "bunx",
      args: ["knip", "--strict", "--no-progress"],
    });
  },
});

const biomeAdapter = defineRule({
  meta: {
    id: biomeAdapterId,
    docs: "Run Biome and surface formatter, import sorting, and lint findings through pokayoke.",
    kind: "adapter",
  },
  async run(context) {
    return runAdapter(context, biomeAdapterId, {
      command: "bunx",
      args: ["biome", "ci", "."],
    });
  },
});

export const builtinRules = {
  [maxFileLines.meta.id]: maxFileLines,
  [noUnusedSuppressions.meta.id]: noUnusedSuppressions,
  [knipAdapter.meta.id]: knipAdapter,
  [biomeAdapter.meta.id]: biomeAdapter,
};

export const recommended = definePreset({
  name: "pokayoke/recommended",
  rules: {
    [maxFileLines.meta.id]: ["warn", { max: 350 }],
    [noUnusedSuppressions.meta.id]: "warn",
  },
});

async function runAdapter(
  context: {
    options: unknown;
    execAdapter: (
      command: string,
      args?: string[],
    ) => Promise<{ exitCode: number; stdout: string; stderr: string }>;
  },
  ruleId: string,
  defaults: Required<AdapterOptions>,
) {
  const options = (context.options ?? {}) as AdapterOptions;
  const command = options.command ?? defaults.command;
  const args = options.args ?? defaults.args;
  const result = await context.execAdapter(command, args);

  if (result.exitCode === 0) {
    return { findings: [] };
  }

  const output = [result.stdout.trim(), result.stderr.trim()].filter(Boolean).join("\n\n");

  return {
    findings: [
      {
        ruleId,
        severity: "error" as const,
        message: `${command} ${args.join(" ")} exited with code ${result.exitCode}.`,
        advice: output.slice(0, 2_000),
      },
    ],
  };
}

function countLines(source: string): number {
  if (source.length === 0) {
    return 0;
  }

  return source.endsWith("\n") ? source.split("\n").length - 1 : source.split("\n").length;
}
