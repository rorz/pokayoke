import { builtinRules, recommended } from "./builtin";
import type { Config } from "./config";
import { bundledPlugins } from "./rules";
import type { Plugin, Preset, RuleRegistry, RuleSetting } from "./types";

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

export async function loadPlugins(config: Config): Promise<Plugin[]> {
  return [...bundledPlugins, ...(config.plugins ?? [])];
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
