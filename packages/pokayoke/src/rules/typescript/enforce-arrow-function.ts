import ts from "typescript";

import { typescriptLocation } from "../../ast";
import { defineRule } from "../../define";

const ruleId = "typescript/enforce-arrow-function";

export const enforceArrowFunction = defineRule({
  meta: {
    id: ruleId,
    docs: "Prefer arrow functions where a project convention requires lexical function values.",
    kind: "file",
  },
  async run(context) {
    const findings = [];

    for (const file of await context.files()) {
      if (!isTypescript(file)) {
        continue;
      }

      const sourceFile = await context.parseTypescript(file);
      const declarations = collectFunctionDeclarations(sourceFile);
      const overloads = findOverloadDeclarations(declarations);

      for (const declaration of declarations) {
        if (declaration.asteriskToken || overloads.has(declaration)) {
          continue;
        }

        const start = declaration.getStart(sourceFile);
        const name = declaration.name?.text ?? "(anonymous)";
        const location = typescriptLocation(sourceFile, start);

        findings.push({
          ruleId,
          severity: "error" as const,
          message: `Use an arrow function instead of function declaration "${name}".`,
          file,
          line: location.line,
          column: location.column,
          advice: `Prefer const ${name === "(anonymous)" ? "name" : name} = (...) => { ... }.`,
        });
      }
    }

    return { findings };
  },
});

function collectFunctionDeclarations(sourceFile: ts.SourceFile): ts.FunctionDeclaration[] {
  const declarations: ts.FunctionDeclaration[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isFunctionDeclaration(node)) {
      declarations.push(node);
    }

    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return declarations;
}

function findOverloadDeclarations(
  declarations: readonly ts.FunctionDeclaration[],
): Set<ts.FunctionDeclaration> {
  const byName = new Map<string, ts.FunctionDeclaration[]>();
  const overloads = new Set<ts.FunctionDeclaration>();

  for (const declaration of declarations) {
    if (!declaration.name) {
      continue;
    }

    const group = byName.get(declaration.name.text) ?? [];
    group.push(declaration);
    byName.set(declaration.name.text, group);
  }

  for (const group of byName.values()) {
    if (group.length > 1 && group.slice(0, -1).every((declaration) => !declaration.body)) {
      for (const declaration of group) {
        overloads.add(declaration);
      }
    }
  }

  return overloads;
}

function isTypescript(file: string): boolean {
  return /\.(c|m)?tsx?$/.test(file) && !/\.d\.(c|m)?ts$/.test(file);
}
