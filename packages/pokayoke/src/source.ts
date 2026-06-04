export type SourceLocation = {
  line: number;
  column: number;
};

export function locate(source: string, index: number): SourceLocation {
  let line = 1;
  let lineStart = 0;

  for (let cursor = 0; cursor < index; cursor += 1) {
    if (source.charCodeAt(cursor) === 10) {
      line += 1;
      lineStart = cursor + 1;
    }
  }

  return {
    column: index - lineStart + 1,
    line,
  };
}

export function lineAt(source: string, index: number): string {
  let start = index;
  let end = index;

  while (start > 0 && source.charCodeAt(start - 1) !== 10) {
    start -= 1;
  }

  while (end < source.length && source.charCodeAt(end) !== 10) {
    end += 1;
  }

  return source.slice(start, end);
}

export function previousLine(source: string, index: number): string {
  let lineStart = index;

  while (lineStart > 0 && source.charCodeAt(lineStart - 1) !== 10) {
    lineStart -= 1;
  }

  if (lineStart === 0) {
    return "";
  }

  const previousEnd = lineStart - 1;
  let previousStart = previousEnd;

  while (previousStart > 0 && source.charCodeAt(previousStart - 1) !== 10) {
    previousStart -= 1;
  }

  return source.slice(previousStart, previousEnd);
}

export function countLines(source: string): number {
  if (source.length === 0) {
    return 0;
  }

  return source.endsWith("\n") ? source.split("\n").length - 1 : source.split("\n").length;
}

export function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
