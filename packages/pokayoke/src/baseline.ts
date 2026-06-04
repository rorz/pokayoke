import type { Finding } from "./types";

export type Baseline = Record<string, string[]>;

export function findingKey(finding: Finding): string {
  return [finding.file ?? "<repo>", finding.line ?? 0, finding.column ?? 0].join(":");
}

export function isBaselined(finding: Finding, baseline: Baseline = {}): boolean {
  const entries = baseline[finding.ruleId];

  if (!entries || entries.length === 0) {
    return false;
  }

  const key = findingKey(finding);
  const file = finding.file ?? "<repo>";
  const lineKey = `${file}:${finding.line ?? 0}`;

  return entries.includes(key) || entries.includes(lineKey);
}
