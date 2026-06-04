import { builtinRules, recommended } from "./builtin";
import type { Config } from "./config";
import { isEnabledSeverity, loadConfig, normalizeRuleSetting } from "./config";
import type { AdapterResult, Finding, Plugin, Preset, RuleRegistry, RuleSetting } from "./types";
import { collectFiles, discoverWorkspaces, readPackageJson } from "./workspace";

const defaultIgnores = ["**/node_modules/**", "**/.git/**"];

export type CheckOptions = {
  root?: string;
  ruleId?: string;
};

export type CheckResult = {
  configPath?: string;
  files: string[];
  findings: Finding[];
  rulesRun: string[];
};

export async function runCheck(options: CheckOptions = {}): Promise<CheckResult> {
  const root = options.root ?? process.cwd();
  const loadedConfig = await loadConfig(root);
  const config = loadedConfig?.config ?? {};
  const plugins = await loadPlugins(config);
  const registry = buildRuleRegistry(plugins);
  const ruleSettings = resolveRuleSettings(config, plugins);
  const files = await collectFiles(root, config.files, [
    ...defaultIgnores,
    ...(config.ignores ?? []),
  ]);
  const findings: Finding[] = [];
  const rulesRun: string[] = [];

  for (const [ruleId, rawSetting] of Object.entries(ruleSettings)) {
    if (options.ruleId && options.ruleId !== ruleId) {
      continue;
    }

    const setting = normalizeRuleSetting(rawSetting);

    if (!isEnabledSeverity(setting.severity)) {
      continue;
    }

    const rule = registry[ruleId];

    if (!rule) {
      findings.push({
        ruleId,
        severity: "error",
        message: `Configured rule "${ruleId}" is not registered.`,
        advice:
          "Install or load the package that provides this rule, or remove it from the config.",
      });
      continue;
    }

    const reported: Finding[] = [];
    const context = {
      root,
      options: setting.options,
      files: async () => files,
      readFile: async (file: string) => Bun.file(`${root}/${file}`).text(),
      parseTypescript: async () => undefined,
      packageJson: async (workspace?: string) => readPackageJson(root, workspace),
      workspaces: async () => discoverWorkspaces(root),
      report: (finding: Finding) => {
        reported.push(finding);
      },
      execAdapter: async (command: string, args: string[] = []): Promise<AdapterResult> => {
        const proc = Bun.spawn([command, ...args], {
          cwd: root,
          stdout: "pipe",
          stderr: "pipe",
        });

        return {
          exitCode: await proc.exited,
          stdout: await new Response(proc.stdout).text(),
          stderr: await new Response(proc.stderr).text(),
        };
      },
    };
    const result = await rule.run(context);
    const ruleFindings = [...reported, ...result.findings];

    for (const finding of ruleFindings) {
      findings.push({
        ...finding,
        ruleId: finding.ruleId || ruleId,
        severity: setting.severity,
      });
    }

    rulesRun.push(ruleId);
  }

  return {
    ...(loadedConfig ? { configPath: loadedConfig.path } : {}),
    files,
    findings,
    rulesRun,
  };
}

function resolveRuleSettings(config: Config, plugins: Plugin[]): Record<string, RuleSetting> {
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

function buildRuleRegistry(plugins: Plugin[]): RuleRegistry {
  return Object.assign({}, builtinRules, ...plugins.map((plugin) => plugin.rules));
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

async function loadPlugins(config: Config): Promise<Plugin[]> {
  const packageNames = new Set<string>();
  const targets = [...(config.extends ?? []), ...Object.keys(config.rules ?? {})];

  for (const target of targets) {
    if (target.startsWith("@pokayoke/typescript/") || target.startsWith("typescript/")) {
      packageNames.add("@pokayoke/typescript");
    }

    if (target.startsWith("@pokayoke/package-policy/") || target.startsWith("package/")) {
      packageNames.add("@pokayoke/package-policy");
    }

    if (target.startsWith("@pokayoke/patterns/") || target.startsWith("patterns/")) {
      packageNames.add("@pokayoke/patterns");
    }
  }

  const plugins: Plugin[] = [...(config.plugins ?? [])];

  for (const packageName of packageNames) {
    const module = (await import(packageName)) as { default?: Plugin };

    if (module.default) {
      plugins.push(module.default);
    }
  }

  return plugins;
}
