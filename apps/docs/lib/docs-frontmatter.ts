import Markdoc from "@markdoc/markdoc";

import type { Doc } from "./docs";

type ParsedMarkdown = Pick<Doc, "content" | "description" | "title">;

function unquoteFrontmatterValue(value: string): string {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

function requiredFrontmatter(
  metadata: Record<string, string>,
  key: "description" | "title",
  file: string,
): string {
  const value = metadata[key]?.trim();

  if (!value) {
    throw new Error(`Missing required ${key} frontmatter in ${file}`);
  }

  return value;
}

function markdownWithoutFrontmatter(source: string): string {
  const lines = source.split(/\r?\n/);

  if (lines[0] !== "---") {
    return source;
  }

  const closingIndex = lines.indexOf("---", 1);

  if (closingIndex < 0) {
    return source;
  }

  return lines
    .slice(closingIndex + 1)
    .join("\n")
    .trimStart();
}

function parseFrontmatter(frontmatter: unknown, file: string): Record<string, string> {
  if (typeof frontmatter !== "string") {
    return {};
  }

  const values: Record<string, string> = {};

  for (const line of frontmatter.split("\n")) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = /^([A-Za-z][A-Za-z0-9_-]*):\s*(.*)$/.exec(line);

    if (!match) {
      throw new Error(`Unsupported frontmatter line in ${file}: ${line}`);
    }

    const key = match[1];
    const rawValue = match[2]?.trim() ?? "";

    if (key) {
      values[key] = unquoteFrontmatterValue(rawValue);
    }
  }

  return values;
}

export function parseMarkdownSource(source: string, file: string): ParsedMarkdown {
  const ast = Markdoc.parse(source, { file });
  const attributes = ast.attributes as { frontmatter?: unknown };
  const metadata = parseFrontmatter(attributes.frontmatter, file);

  return {
    content: markdownWithoutFrontmatter(source),
    description: requiredFrontmatter(metadata, "description", file),
    title: requiredFrontmatter(metadata, "title", file),
  };
}
