import ts from "typescript";

import { typescriptLocation } from "../../ast";
import { defineRule } from "../../define";
import type { Finding } from "../../types";

const ruleId = "typescript/no-forward-reference";

type Binding = {
  declaration: ts.Statement;
  namePosition: number;
  nameLine: number;
};

export const noForwardReference = defineRule({
  meta: {
    id: ruleId,
    docs: "Prevent declarations from referencing values before they are defined.",
    kind: "file",
  },
  async run(context) {
    const findings: Finding[] = [];

    for (const file of await context.files()) {
      if (!isTypescript(file)) {
        continue;
      }

      const sourceFile = await context.parseTypescript(file);
      const bindings = collectTopLevelBindings(sourceFile);

      const visit = (node: ts.Node): void => {
        if (ts.isIdentifier(node)) {
          const binding = bindings.get(node.text);
          const referencePosition = node.getStart(sourceFile);

          if (
            binding &&
            referencePosition < binding.namePosition &&
            isRuntimeReference(node, binding)
          ) {
            const location = typescriptLocation(sourceFile, referencePosition);
            findings.push({
              ruleId,
              severity: "error" as const,
              message: `"${node.text}" is referenced before it is declared.`,
              file,
              line: location.line,
              column: location.column,
              advice: `Move the declaration above this reference, or suppress with a reason for deliberate mutual recursion. Declared on line ${binding.nameLine}.`,
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

function collectTopLevelBindings(sourceFile: ts.SourceFile): Map<string, Binding> {
  const bindings = new Map<string, Binding>();

  const record = (name: ts.Identifier | undefined, statement: ts.Statement): void => {
    if (!name) {
      return;
    }

    const location = typescriptLocation(sourceFile, name.getStart(sourceFile));
    bindings.set(name.text, {
      declaration: statement,
      nameLine: location.line,
      namePosition: name.getStart(sourceFile),
    });
  };

  for (const statement of sourceFile.statements) {
    if (ts.isVariableStatement(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          record(declaration.name, statement);
        }
      }
    } else if (ts.isFunctionDeclaration(statement) || ts.isClassDeclaration(statement)) {
      record(statement.name, statement);
    } else if (ts.isEnumDeclaration(statement)) {
      record(statement.name, statement);
    }
  }

  return bindings;
}

function isRuntimeReference(node: ts.Identifier, binding: Binding): boolean {
  return (
    !isDeclarationName(node) &&
    !isInTypePosition(node) &&
    !isInsideDeclaration(node, binding.declaration) &&
    !isInsideDeferredRuntime(node)
  );
}

function isDeclarationName(node: ts.Identifier): boolean {
  const parent = node.parent;

  return Boolean(parent && "name" in parent && parent.name === node);
}

function isInTypePosition(node: ts.Node): boolean {
  let parent = node.parent;

  while (parent) {
    if (parent.kind >= ts.SyntaxKind.FirstTypeNode && parent.kind <= ts.SyntaxKind.LastTypeNode) {
      return true;
    }

    parent = parent.parent;
  }

  return false;
}

function isInsideDeclaration(node: ts.Node, declaration: ts.Statement): boolean {
  let parent = node.parent;

  while (parent) {
    if (parent === declaration) {
      return true;
    }

    parent = parent.parent;
  }

  return false;
}

function isInsideDeferredRuntime(node: ts.Node): boolean {
  let parent = node.parent;

  while (parent) {
    if (
      ts.isArrowFunction(parent) ||
      ts.isFunctionDeclaration(parent) ||
      ts.isFunctionExpression(parent) ||
      ts.isMethodDeclaration(parent) ||
      ts.isGetAccessor(parent) ||
      ts.isSetAccessor(parent) ||
      ts.isConstructorDeclaration(parent)
    ) {
      return true;
    }

    parent = parent.parent;
  }

  return false;
}

function isTypescript(file: string): boolean {
  return /\.(c|m)?tsx?$/.test(file) && !/\.d\.(c|m)?ts$/.test(file);
}
