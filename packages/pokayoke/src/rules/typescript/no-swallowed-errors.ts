import ts from "typescript";

import { typescriptLocation } from "../../ast";
import { defineRule } from "../../define";
import type { Finding } from "../../types";

const ruleId = "typescript/no-swallowed-errors";

export const noSwallowedErrors = defineRule({
  meta: {
    id: ruleId,
    docs: "Require catch blocks to bind and use the thrown value.",
    kind: "file",
  },
  async run(context) {
    const findings: Finding[] = [];

    for (const file of await context.files()) {
      if (!isTypescript(file)) {
        continue;
      }

      const sourceFile = await context.parseTypescript(file);

      const visit = (node: ts.Node): void => {
        if (ts.isCatchClause(node)) {
          const message = catchClauseMessage(node);

          if (message) {
            const location = typescriptLocation(sourceFile, node.getStart(sourceFile));
            findings.push({
              ruleId,
              severity: "error" as const,
              message,
              file,
              line: location.line,
              column: location.column,
              advice:
                "Log, report, wrap with cause, rethrow, or suppress with a reason for intentional fallback behavior.",
            });
          }
        }

        ts.forEachChild(node, visit);
      };

      visit(sourceFile);
    }

    return { findings };
  },
});

function catchClauseMessage(clause: ts.CatchClause): string | undefined {
  if (clause.block.statements.length === 0) {
    return "Catch block is empty.";
  }

  const binding = clause.variableDeclaration?.name;

  if (!binding || !ts.isIdentifier(binding)) {
    return "Catch block must bind the thrown value.";
  }

  if (binding.text.startsWith("_") || !referencesIdentifier(clause.block, binding.text)) {
    return `Caught error "${binding.text}" is not used.`;
  }

  return undefined;
}

function referencesIdentifier(node: ts.Node, name: string): boolean {
  let found = false;

  const visit = (child: ts.Node): void => {
    if (found) {
      return;
    }

    if (ts.isIdentifier(child) && child.text === name) {
      found = true;
      return;
    }

    ts.forEachChild(child, visit);
  };

  ts.forEachChild(node, visit);
  return found;
}

function isTypescript(file: string): boolean {
  return /\.(c|m)?tsx?$/.test(file) && !/\.d\.(c|m)?ts$/.test(file);
}
