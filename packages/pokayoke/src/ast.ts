import ts from "typescript";

export type TypeScriptSourceFile = ts.SourceFile;

export function parseTypescriptSource(file: string, source: string): ts.SourceFile {
  return ts.createSourceFile(file, source, ts.ScriptTarget.Latest, true, scriptKindForPath(file));
}

export function typescriptLocation(
  sourceFile: ts.SourceFile,
  index: number,
): {
  column: number;
  line: number;
} {
  const position = sourceFile.getLineAndCharacterOfPosition(index);

  return {
    column: position.character + 1,
    line: position.line + 1,
  };
}

export function forEachTypescriptNode(node: ts.Node, visit: (node: ts.Node) => void): void {
  visit(node);
  ts.forEachChild(node, (child) => forEachTypescriptNode(child, visit));
}

function scriptKindForPath(file: string): ts.ScriptKind {
  if (file.endsWith(".tsx")) {
    return ts.ScriptKind.TSX;
  }

  if (file.endsWith(".jsx")) {
    return ts.ScriptKind.JSX;
  }

  return ts.ScriptKind.TS;
}
