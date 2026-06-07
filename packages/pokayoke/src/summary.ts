import { renderMasthead } from "./brand";
import { configLookupOrder } from "./config";

export const projectPositioning = [
  "Repo-policy checks for rules that are awkward in ESLint and outside Knip's scope.",
  "Architectural invariants, generated artifact drift, workspace policy, docs-to-code consistency, and regression rails.",
  "Built for humans and agents to consume the same conventions.",
] as const;

export const ruleKinds = ["file", "project", "adapter"] as const;

export const mvpOrder = [
  "CLI, config loader, JSONC parser, and schema validation.",
  "File collection with files, ignores, workspaces, and overrides.",
  "Terminal and JSON reporters.",
  "Suppression parser with required reasons and unused-suppression reporting.",
  "Generic TypeScript, package policy, and pattern rules.",
  "Adapter rules for existing tools.",
  "Fix support after the reporting model is stable.",
] as const;

export function renderProjectSummary(): string {
  const lines = [
    renderMasthead(),
    "",
    ...projectPositioning,
    "",
    "Rule kinds:",
    ...ruleKinds.map((kind) => `- ${kind}`),
    "",
    "Config file:",
    ...configLookupOrder.map((target) => `- ${target}`),
    "",
    "MVP order:",
    ...mvpOrder.map((step, index) => `${index + 1}. ${step}`),
  ];

  return `${lines.join("\n")}\n`;
}
