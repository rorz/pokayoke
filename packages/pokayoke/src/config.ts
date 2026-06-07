import type { NormalizedRuleSetting, RuleSetting, RuleSeverity } from "./types";

export const configLookupOrder = ["pokayoke.jsonc"] as const;

export type ConfigLookupTarget = (typeof configLookupOrder)[number];

export type SuppressionConfig = {
  directive?: string;
  fileLineLimit?: number;
  requireReason?: boolean;
  reportUnused?: RuleSeverity;
};

export type Config = {
  $schema?: string;
  extends?: string[];
  files?: string[];
  ignores?: string[];
  localRules?: string[];
  suppressions?: SuppressionConfig;
  rules?: Record<string, RuleSetting>;
  overrides?: Array<{
    files: string[];
    rules: Record<string, RuleSetting>;
  }>;
  workspaces?: Record<string, unknown>;
  adapters?: Record<string, RuleSetting>;
  baseline?: Record<string, string[]>;
};

export function normalizeRuleSetting<TOptions = unknown>(
  setting: RuleSetting<TOptions>,
): NormalizedRuleSetting<TOptions> {
  if (Array.isArray(setting)) {
    const [severity, options] = setting;

    return { severity, options };
  }

  return { severity: setting };
}

export function isEnabledSeverity(severity: string): severity is "warn" | "error" {
  return severity === "warn" || severity === "error";
}

export async function loadConfig(root: string): Promise<{
  path: string;
  config: Config;
} | null> {
  const target = "pokayoke.jsonc";
  const path = `${root}/${target}`;
  const file = Bun.file(path);

  if (!(await file.exists())) {
    return null;
  }

  return {
    path: target,
    config: parseJsonc(await file.text()) as Config,
  };
}

export function parseJsonc(source: string): unknown {
  return JSON.parse(stripJsonc(source).replace(/,\s*([}\]])/g, "$1"));
}

export function stripJsonc(source: string): string {
  let output = "";
  let inString = false;
  let quote = "";
  let escaped = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let index = 0; index < source.length; index += 1) {
    const char = source.charAt(index);
    const next = source.charAt(index + 1);

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false;
        output += char;
      }

      continue;
    }

    if (inBlockComment) {
      if (char === "*" && next === "/") {
        inBlockComment = false;
        index += 1;
        continue;
      }

      if (char === "\n") {
        output += char;
      }

      continue;
    }

    if (inString) {
      output += char;

      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        inString = false;
        quote = "";
      }

      continue;
    }

    if (char === '"' || char === "'") {
      inString = true;
      quote = char;
      output += char;
      continue;
    }

    if (char === "/" && next === "/") {
      inLineComment = true;
      index += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      inBlockComment = true;
      index += 1;
      continue;
    }

    output += char;
  }

  return output;
}
