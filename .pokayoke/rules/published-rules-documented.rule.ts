import type { Plugin, Preset, Rule } from "pokayoke";
import { builtinRules, bundledPlugins, recommended } from "pokayoke";

const ruleId = "docs/published-rules-documented";
const docsPath = "apps/docs/content/20-reference/100-included-rules.md";

export const publishedRulesDocumented: Rule = {
  meta: {
    id: ruleId,
    docs: "Require the rules reference to cover every published rule and preset.",
    kind: "project",
  },
  async run(context) {
    const source = await context.readFile(docsPath);
    const documentedRules = ruleHeadings(source);
    const findings = [];

    for (const rule of expectedPublishedRuleIds()) {
      if (!documentedRules.has(rule)) {
        findings.push({
          ruleId,
          severity: "error" as const,
          message: `${rule} is missing from the published rules reference.`,
          file: docsPath,
          advice: `Add a ### ${rule} section to the included rules reference.`,
        });
      }
    }

    for (const heading of documentedRules) {
      if (!expectedPublishedRuleIds().includes(heading)) {
        findings.push({
          ruleId,
          severity: "error" as const,
          message: `${heading} is documented but is not a published rule.`,
          file: docsPath,
          advice: "Remove the stale section or export/register the rule from the package.",
        });
      }
    }

    for (const preset of expectedPublishedPresetNames()) {
      if (!source.includes(`\`${preset}\``)) {
        findings.push({
          ruleId,
          severity: "error" as const,
          message: `${preset} is missing from the published preset reference.`,
          file: docsPath,
          advice: "Add the preset to the included rules table.",
        });
      }
    }

    return { findings };
  },
};

export function expectedPublishedRuleIds(): string[] {
  const rules = new Map<string, Rule>();

  for (const [id, rule] of Object.entries(builtinRules)) {
    rules.set(id, rule);
  }

  for (const plugin of bundledPlugins as Plugin[]) {
    for (const [id, rule] of Object.entries(plugin.rules)) {
      rules.set(id, rule);
    }
  }

  return [...rules.keys()].sort();
}

export function expectedPublishedPresetNames(): string[] {
  const presets = new Map<string, Preset>();

  presets.set(recommended.name, recommended);

  for (const plugin of bundledPlugins as Plugin[]) {
    for (const preset of Object.values(plugin.presets ?? {})) {
      presets.set(preset.name, preset);
    }
  }

  return [...presets.keys()].sort();
}

function ruleHeadings(source: string): Set<string> {
  return new Set(
    [...source.matchAll(/^###\s+`?([^`\n]+)`?\s*$/gm)]
      .map((match) => match[1])
      .filter((value): value is string => Boolean(value)),
  );
}
