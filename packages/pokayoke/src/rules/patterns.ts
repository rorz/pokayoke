import { definePlugin, definePreset, defineRule } from "../define";
import { locate } from "../source";
import type { Finding } from "../types";

type PatternInput =
  | string
  | {
      flags?: string;
      message?: string;
      pattern: string;
    };

type PatternOptions = {
  files?: string[];
  patterns?: PatternInput[];
};

type FileMustMatchOptions = PatternOptions & {
  pattern?: string;
};

const noBannedTextId = "patterns/no-banned-text";
const requiredTextId = "patterns/required-text";
const fileMustMatchId = "patterns/file-must-match";

export const noBannedText = defineRule({
  meta: {
    id: noBannedTextId,
    docs: "Disallow configured text patterns in selected files.",
    kind: "file",
  },
  async run(context) {
    const options = context.options as PatternOptions;
    const patterns = compilePatterns(options.patterns);
    const findings: Finding[] = [];

    for (const file of await selectedFiles(context.files, options.files)) {
      const source = await context.readFile(file);

      for (const pattern of patterns) {
        pattern.regex.lastIndex = 0;
        let match: RegExpExecArray | null = pattern.regex.exec(source);

        while (match) {
          const location = locate(source, match.index);
          findings.push({
            ruleId: noBannedTextId,
            severity: "error" as const,
            message: pattern.message ?? `Banned text pattern matched: ${pattern.label}`,
            file,
            line: location.line,
            column: location.column,
          });
          match = pattern.regex.exec(source);
        }
      }
    }

    return { findings };
  },
});

export const requiredText = defineRule({
  meta: {
    id: requiredTextId,
    docs: "Require configured text patterns in selected files.",
    kind: "file",
  },
  async run(context) {
    const options = context.options as PatternOptions;
    const patterns = compilePatterns(options.patterns);
    const findings: Finding[] = [];

    for (const file of await selectedFiles(context.files, options.files)) {
      const source = await context.readFile(file);

      for (const pattern of patterns) {
        pattern.regex.lastIndex = 0;

        if (!pattern.regex.test(source)) {
          findings.push({
            ruleId: requiredTextId,
            severity: "error" as const,
            message: pattern.message ?? `Required text pattern is missing: ${pattern.label}`,
            file,
          });
        }
      }
    }

    return { findings };
  },
});

export const fileMustMatch = defineRule({
  meta: {
    id: fileMustMatchId,
    docs: "Require a file to match a configured regular expression or exact text block.",
    kind: "file",
  },
  async run(context) {
    const options = context.options as FileMustMatchOptions;
    const patterns = compilePatterns(
      options.patterns ?? (options.pattern ? [options.pattern] : []),
    );
    const findings: Finding[] = [];

    for (const file of await selectedFiles(context.files, options.files)) {
      const source = await context.readFile(file);

      for (const pattern of patterns) {
        pattern.regex.lastIndex = 0;

        if (!pattern.regex.test(source)) {
          findings.push({
            ruleId: fileMustMatchId,
            severity: "error" as const,
            message: pattern.message ?? `${file} must match ${pattern.label}.`,
            file,
          });
        }
      }
    }

    return { findings };
  },
});

const rules = {
  [noBannedText.meta.id]: noBannedText,
  [requiredText.meta.id]: requiredText,
  [fileMustMatch.meta.id]: fileMustMatch,
};

const recommended = definePreset({
  name: "pokayoke/patterns/recommended",
  rules: {},
});

export default definePlugin({
  name: "pokayoke/patterns",
  rules,
  presets: {
    recommended,
  },
});

async function selectedFiles(
  files: () => Promise<string[]>,
  patterns: string[] = ["**/*"],
): Promise<string[]> {
  const globs = patterns.map((pattern) => new Bun.Glob(pattern));

  return (await files()).filter((file) => globs.some((glob) => glob.match(file)));
}

function compilePatterns(inputs: PatternInput[] = []) {
  return inputs.map((input) => {
    const pattern = typeof input === "string" ? input : input.pattern;
    const flags = typeof input === "string" ? "g" : (input.flags ?? "g");

    return {
      label: pattern,
      message: typeof input === "string" ? undefined : input.message,
      regex: new RegExp(pattern, flags.includes("g") ? flags : `${flags}g`),
    };
  });
}
