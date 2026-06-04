export type DirectiveComment = {
  body: string;
  directive: string;
  index: number;
};

export function findDirectiveComments(
  source: string,
  directives: readonly string[],
): DirectiveComment[] {
  const comments: DirectiveComment[] = [];
  let quote: '"' | "'" | "`" | undefined;
  let escaped = false;
  let index = 0;

  while (index < source.length) {
    const char = source.charAt(index);
    const next = source.charAt(index + 1);

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = undefined;
      }

      index += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      index += 1;
      continue;
    }

    if (char === "/" && next === "/") {
      const end = source.indexOf("\n", index + 2);
      const bodyEnd = end === -1 ? source.length : end;
      pushDirectiveComment(comments, directives, source.slice(index + 2, bodyEnd), index);
      index = bodyEnd;
      continue;
    }

    if (char === "/" && next === "*") {
      const end = source.indexOf("*/", index + 2);
      const bodyEnd = end === -1 ? source.length : end;
      pushDirectiveComment(comments, directives, source.slice(index + 2, bodyEnd), index);
      index = end === -1 ? bodyEnd : end + 2;
      continue;
    }

    index += 1;
  }

  return comments;
}

function pushDirectiveComment(
  comments: DirectiveComment[],
  directives: readonly string[],
  rawBody: string,
  index: number,
): void {
  const body = rawBody.trim();

  for (const directive of directives) {
    if (body.startsWith(`${directive}:`)) {
      comments.push({
        body: body.slice(directive.length + 1).trim(),
        directive,
        index,
      });
      return;
    }
  }
}
