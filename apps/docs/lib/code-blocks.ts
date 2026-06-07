export type HighlightedCodeBlocks = Record<string, string>;

const languageAliases: Record<string, string> = {
  bash: "sh",
  js: "javascript",
  md: "markdown",
  plain: "text",
  plaintext: "text",
  shell: "sh",
  shellscript: "sh",
  ts: "typescript",
  txt: "text",
  yml: "yaml",
  zsh: "sh",
};

export function normalizeFenceLanguage(language: string | undefined): string {
  const normalized = language?.trim().toLowerCase().split(/\s+/, 1)[0] ?? "";

  if (!normalized) {
    return "text";
  }

  return languageAliases[normalized] ?? normalized;
}

export function codeBlockKey(code: string, language: string | undefined): string {
  const normalizedLanguage = normalizeFenceLanguage(language);

  return `${normalizedLanguage}-${hashString(`${normalizedLanguage}\0${code}`)}`;
}

function hashString(value: string): string {
  let hash = 0x811c9dc5;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }

  return (hash >>> 0).toString(36);
}
