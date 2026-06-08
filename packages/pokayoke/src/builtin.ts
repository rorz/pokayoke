import { definePreset, defineRule } from "./define";

const noFindings = async () => ({ findings: [] });

type MaxFileLinesOptions = {
  max?: number;
  ignore?: string[];
};

const maxFileLinesId = "structure/max-file-lines";
const noUnusedSuppressionsId = "suppressions/no-unused";

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

export const builtinRules = {
  [maxFileLines.meta.id]: maxFileLines,
  [noUnusedSuppressions.meta.id]: noUnusedSuppressions,
};

export const recommended = definePreset({
  name: "pokayoke/recommended",
  rules: {
    [maxFileLines.meta.id]: ["warn", { max: 350 }],
    [noUnusedSuppressions.meta.id]: "warn",
  },
});

function countLines(source: string): number {
  if (source.length === 0) {
    return 0;
  }

  return source.endsWith("\n") ? source.split("\n").length - 1 : source.split("\n").length;
}
