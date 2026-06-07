import ts from "typescript";

import { typescriptLocation } from "../../ast";
import { defineRule } from "../../define";
import type { Finding } from "../../types";

const ruleId = "typescript/no-optional-env";

type NoOptionalEnvOptions = {
  files?: string[];
};

const defaultFiles = ["**/src/env.ts", "**/env.ts"];

export const noOptionalEnv = defineRule({
  meta: {
    id: ruleId,
    docs: "Require optional environment schema entries to carry an explicit justification.",
    kind: "file",
  },
  async run(context) {
    const options = (context.options ?? {}) as NoOptionalEnvOptions;
    const files = selectedFiles(await context.files(), options.files ?? defaultFiles);
    const findings: Finding[] = [];

    for (const file of files) {
      if (!isTypescript(file)) {
        continue;
      }

      const sourceFile = await context.parseTypescript(file);

      const visit = (node: ts.Node): void => {
        if (isOptionalCall(node)) {
          const location = typescriptLocation(
            sourceFile,
            node.expression.name.getStart(sourceFile),
          );
          findings.push({
            ruleId,
            severity: "error" as const,
            message: "Optional environment schema entry needs an explicit justification.",
            file,
            line: location.line,
            column: location.column,
            advice:
              "Env values should be required by default. If absence is a supported mode, add a pokayoke suppression with that reason.",
          });
        }

        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
    }

    return { findings };
  },
});

function selectedFiles(files: readonly string[], patterns: readonly string[]): string[] {
  const globs = patterns.map((pattern) => new Bun.Glob(pattern));

  return files.filter((file) => globs.some((glob) => glob.match(file)));
}

function isOptionalCall(node: ts.Node): node is ts.CallExpression & {
  expression: ts.PropertyAccessExpression;
} {
  return (
    ts.isCallExpression(node) &&
    ts.isPropertyAccessExpression(node.expression) &&
    node.expression.name.text === "optional"
  );
}

function isTypescript(file: string): boolean {
  return /\.(c|m)?tsx?$/.test(file) && !/\.d\.(c|m)?ts$/.test(file);
}
