import type { Config } from "./config";
import type { Plugin, Preset, Rule } from "./types";

export function defineConfig(config: Config): Config {
  return config;
}

export function defineRule<TOptions = unknown>(rule: Rule<TOptions>): Rule<TOptions> {
  return rule;
}

export function definePreset(preset: Preset): Preset {
  return preset;
}

export function definePlugin(plugin: Plugin): Plugin {
  return plugin;
}
