import { parseTypescriptSource } from "./ast";
import { isBaselined } from "./baseline";
import { isEnabledSeverity, loadConfig, normalizeRuleSetting } from "./config";
import { buildRuleRegistry, loadPlugins, resolveRuleSettings } from "./registry";
import {
  applySuppressions,
  findSuppressions,
  normalizeSuppressionConfig,
  unusedSuppressionFindings,
  validateSuppressions,
} from "./suppressions";
import type { Finding } from "./types";
import { collectFiles, discoverWorkspaces, readPackageJson } from "./workspace";

const defaultIgnores = ["**/node_modules/**", "**/.git/**"];

export type CheckOptions = {
  fix?: boolean;
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
  const plugins = await loadPlugins(config, root);
  const registry = buildRuleRegistry(plugins);
  const ruleSettings = resolveRuleSettings(config, plugins);
  const fix = options.fix ?? false;
  const files = await collectFiles(root, config.files, [
    ...defaultIgnores,
    ...(config.ignores ?? []),
  ]);
  const fileCache = new Map<string, Promise<string>>();
  const astCache = new Map<string, Promise<import("typescript").SourceFile>>();
  const readFile = (file: string): Promise<string> => {
    const cached = fileCache.get(file);

    if (cached) {
      return cached;
    }

    const next = Bun.file(`${root}/${file}`).text();
    fileCache.set(file, next);
    return next;
  };
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
      fix,
      root,
      options: setting.options,
      files: async () => files,
      glob: async (patterns: string | string[]) =>
        collectFiles(root, Array.isArray(patterns) ? patterns : [patterns], defaultIgnores),
      readFile,
      parseTypescript: async (file: string) => {
        const cached = astCache.get(file);

        if (cached) {
          return cached;
        }

        const next = readFile(file).then((source) => parseTypescriptSource(file, source));
        astCache.set(file, next);
        return next;
      },
      packageJson: async (workspace?: string) => readPackageJson(root, workspace),
      workspaces: async () => discoverWorkspaces(root),
      report: (finding: Finding) => {
        reported.push(finding);
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

  const suppressionConfig = normalizeSuppressionConfig(config.suppressions);
  const suppressions = (
    await Promise.all(
      files.map(async (file) => findSuppressions(file, await readFile(file), suppressionConfig)),
    )
  ).flat();
  const activeFindings = applySuppressions(
    findings.filter((finding) => !isBaselined(finding, config.baseline)),
    suppressions,
  );
  activeFindings.push(...validateSuppressions(suppressions, suppressionConfig));

  if (isEnabledSeverity(suppressionConfig.reportUnused)) {
    activeFindings.push(...unusedSuppressionFindings(suppressions, suppressionConfig.reportUnused));
  }

  return {
    ...(loadedConfig ? { configPath: loadedConfig.path } : {}),
    files,
    findings: activeFindings,
    rulesRun,
  };
}
