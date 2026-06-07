import { findDirectiveComments } from "./comment-scanner";
import type { SuppressionConfig } from "./config";
import { locate } from "./source";
import type { EnabledSeverity, Finding, RuleSeverity } from "./types";

export type SuppressionScope = "line" | "file";

export type Suppression = {
  column: number;
  directive: string;
  file: string;
  line: number;
  reason?: string;
  ruleIds: string[];
  scope: SuppressionScope;
  used: boolean;
};

export type NormalizedSuppressionConfig = {
  directive: string;
  fileDirective: string;
  fileLineLimit: number;
  reportUnused: RuleSeverity;
  requireReason: boolean;
};

export function normalizeSuppressionConfig(
  config: SuppressionConfig = {},
): NormalizedSuppressionConfig {
  const directive = config.directive ?? "pokayoke-ignore";

  return {
    directive,
    fileDirective: `${directive}-file`,
    fileLineLimit: config.fileLineLimit ?? 10,
    reportUnused: config.reportUnused ?? "warn",
    requireReason: config.requireReason ?? true,
  };
}

export function findSuppressions(
  file: string,
  source: string,
  config: NormalizedSuppressionConfig,
): Suppression[] {
  if (/\.(md|mdx)$/i.test(file)) {
    return [];
  }

  const directives = [config.directive, config.fileDirective];
  const suppressions: Suppression[] = [];

  for (const comment of findDirectiveComments(source, directives)) {
    const location = locate(source, comment.index);
    const parsed = parseSuppressionBody(comment.body);

    if (parsed.ruleIds.length > 0) {
      suppressions.push({
        column: location.column,
        directive: comment.directive,
        file,
        line: location.line,
        ...(parsed.reason ? { reason: parsed.reason } : {}),
        ruleIds: parsed.ruleIds,
        scope: comment.directive.endsWith("-file") ? "file" : "line",
        used: false,
      });
    }
  }

  return suppressions;
}

export function applySuppressions(
  findings: readonly Finding[],
  suppressions: Suppression[],
): Finding[] {
  return findings.filter((finding) => {
    const suppression = findMatchingSuppression(finding, suppressions);

    if (!suppression) {
      return true;
    }

    suppression.used = true;
    return false;
  });
}

export function validateSuppressions(
  suppressions: readonly Suppression[],
  config: NormalizedSuppressionConfig,
): Finding[] {
  const findings: Finding[] = [];

  for (const suppression of suppressions) {
    if (config.requireReason && !suppression.reason) {
      findings.push(
        suppressionFinding(suppression, "missing-reason", "Suppression is missing a reason."),
      );
    }

    if (suppression.scope === "file" && suppression.line > config.fileLineLimit) {
      findings.push(
        suppressionFinding(
          suppression,
          "file-too-low",
          `File-level suppression must appear in the first ${config.fileLineLimit} lines.`,
        ),
      );
    }
  }

  return findings;
}

export function unusedSuppressionFindings(
  suppressions: readonly Suppression[],
  severity: EnabledSeverity,
): Finding[] {
  return suppressions
    .filter((suppression) => !suppression.used)
    .map((suppression) => ({
      ruleId: "suppressions/no-unused",
      severity,
      message: `Suppression for ${suppression.ruleIds.join(", ")} did not suppress a finding.`,
      file: suppression.file,
      line: suppression.line,
      column: suppression.column,
      advice: "Remove the stale suppression or update the rule id it names.",
    }));
}

function findMatchingSuppression(
  finding: Finding,
  suppressions: readonly Suppression[],
): Suppression | undefined {
  if (!finding.file) {
    return undefined;
  }

  return suppressions.find((suppression) => {
    if (suppression.file !== finding.file || !mentionsRule(suppression, finding.ruleId)) {
      return false;
    }

    if (suppression.scope === "file") {
      return true;
    }

    return finding.line === suppression.line || finding.line === suppression.line + 1;
  });
}

function mentionsRule(suppression: Suppression, ruleId: string): boolean {
  return suppression.ruleIds.includes("*") || suppression.ruleIds.includes(ruleId);
}

function parseSuppressionBody(body: string): {
  reason?: string;
  ruleIds: string[];
} {
  const [rawIds = "", rawReason] = body.split(/\s+--\s+/, 2);
  const ruleIds = rawIds
    .split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  return {
    ...(rawReason?.trim() ? { reason: rawReason.trim() } : {}),
    ruleIds,
  };
}

function suppressionFinding(suppression: Suppression, suffix: string, message: string): Finding {
  return {
    ruleId: `suppressions/${suffix}`,
    severity: "error",
    message,
    file: suppression.file,
    line: suppression.line,
    column: suppression.column,
    advice: `Use "${suppression.directive}: ${suppression.ruleIds.join(", ")} -- <reason>".`,
  };
}
