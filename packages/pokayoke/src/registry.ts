import { builtinRules, recommended } from "./builtin";
import type { Config } from "./config";
import { bundledPlugins } from "./rules";
import type { Plugin, Preset, Rule, RuleRegistry, RuleSetting } from "./types";

export function resolveRuleSettings(
  config: Config,
  plugins: Plugin[],
): Record<string, RuleSetting> {
  const presets = buildPresetRegistry(plugins);
  const rules: Record<string, RuleSetting> = {};

  for (const presetName of config.extends ?? []) {
    const preset = presets[presetName];

    if (!preset) {
      throw new Error(`Preset "${presetName}" is not registered.`);
    }

    Object.assign(rules, preset.rules);
  }

  Object.assign(rules, config.rules);

  for (const [name, setting] of Object.entries(config.adapters ?? {})) {
    rules[`adapter/${name}`] = setting;
  }

  return rules;
}

export function buildRuleRegistry(plugins: Plugin[]): RuleRegistry {
  return Object.assign({}, builtinRules, ...plugins.map((plugin) => plugin.rules));
}

export async function loadPlugins(config: Config, root: string): Promise<Plugin[]> {
  return [...bundledPlugins, await loadLocalRules(config, root)];
}

function buildPresetRegistry(plugins: Plugin[]): Record<string, Preset> {
  const presets: Record<string, Preset> = {
    [recommended.name]: recommended,
  };

  for (const plugin of plugins) {
    for (const preset of Object.values(plugin.presets ?? {})) {
      presets[preset.name] = preset;
    }
  }

  return presets;
}

async function loadLocalRules(config: Config, root: string): Promise<Plugin> {
  const rules: RuleRegistry = {};

  for (const file of await collectLocalRuleFiles(config.localRules, root)) {
    const module = (await import(
      `${Bun.pathToFileURL(`${root}/${file}`).href}?t=${Date.now()}`
    )) as Record<string, unknown>;

    for (const value of Object.values(module)) {
      if (isRule(value)) {
        rules[value.meta.id] = value;
      }
    }
  }

  return {
    name: "local",
    rules,
  };
}

async function collectLocalRuleFiles(patterns: string[] = [], root: string): Promise<string[]> {
  const files = new Set<string>();

  for (const pattern of patterns) {
    const glob = new Bun.Glob(pattern);

    for await (const file of glob.scan({ cwd: root, dot: true, onlyFiles: true })) {
      files.add(file);
    }
  }

  return [...files].sort();
}

function isRule(value: unknown): value is Rule {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const candidate = value as {
    meta?: {
      id?: unknown;
    };
    run?: unknown;
  };

  return typeof candidate.meta?.id === "string" && typeof candidate.run === "function";
}
