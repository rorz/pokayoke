import type { NormalizedRuleSetting, Plugin, RuleSetting, RuleSeverity } from "./types";

export const configLookupOrder = [
  "pokayoke.config.ts",
  "pokayoke.config.js",
  "pokayoke.jsonc",
  ".pokayoke/config.ts",
  ".pokayoke/pokayoke.ts",
  ".pokayoke/pokayoke.jsonc",
  ".pokayoke.jsonc",
  "package.json#pokayoke",
] as const;

export type ConfigLookupTarget = (typeof configLookupOrder)[number];

export type SuppressionConfig = {
  directive?: string;
  fileLineLimit?: number;
  legacyDirectives?: string[];
  requireReason?: boolean;
  reportUnused?: RuleSeverity;
};

export type Config = {
  $schema?: string;
  extends?: string[];
  files?: string[];
  ignores?: string[];
  plugins?: Plugin[];
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
  for (const target of configLookupOrder) {
    if (target === "package.json#pokayoke") {
      const packageJson = await readJsonIfExists(`${root}/package.json`);
      const config = readPackageJsonConfig(packageJson);

      if (config) {
        return {
          path: "package.json#pokayoke",
          config,
        };
      }

      continue;
    }

    const path = `${root}/${target}`;
    const file = Bun.file(path);

    if (!(await file.exists())) {
      continue;
    }

    if (target.endsWith(".jsonc")) {
      return {
        path: target,
        config: parseJsonc(await file.text()) as Config,
      };
    }

    if (target.endsWith(".ts") || target.endsWith(".js")) {
      return {
        path: target,
        config: await loadTypescriptConfig(path),
      };
    }

    throw new Error(`Config loader for ${target} is not implemented.`);
  }

  return null;
}

async function loadTypescriptConfig(path: string): Promise<Config> {
  const module = (await import(`${Bun.pathToFileURL(path).href}?t=${Date.now()}`)) as {
    default?: unknown;
  };

  if (!isRecord(module.default)) {
    throw new Error(`${path} must default-export a pokayoke config object.`);
  }

  return module.default as Config;
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

async function readJsonIfExists(path: string): Promise<unknown> {
  const file = Bun.file(path);

  if (!(await file.exists())) {
    return undefined;
  }

  return JSON.parse(await file.text());
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readPackageJsonConfig(value: unknown): Config | undefined {
  if (!isRecord(value)) {
    return undefined;
  }

  const packageJson = value as { pokayoke?: unknown };

  if (!isRecord(packageJson.pokayoke)) {
    return undefined;
  }

  return packageJson.pokayoke as Config;
}
