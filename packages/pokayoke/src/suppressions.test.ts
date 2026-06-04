import { describe, expect, test } from "bun:test";

import { isBaselined } from "./baseline";
import {
  applySuppressions,
  findSuppressions,
  normalizeSuppressionConfig,
  unusedSuppressionFindings,
  validateSuppressions,
} from "./suppressions";
import type { Finding } from "./types";

const config = normalizeSuppressionConfig({
  directive: "pokayoke-ignore",
  requireReason: true,
  reportUnused: "warn",
});

describe("suppressions", () => {
  test("suppresses same-line and previous-line findings", () => {
    const source = [
      "const same = 1; // pokayoke-ignore: demo/rule -- intentional",
      "// pokayoke-ignore: demo/rule -- intentional",
      "const next = 2;",
    ].join("\n");
    const suppressions = findSuppressions("fixture.ts", source, config);
    const findings: Finding[] = [
      finding(1, "same-line"),
      finding(3, "previous-line"),
      finding(4, "unsuppressed"),
    ];

    expect(applySuppressions(findings, suppressions).map((item) => item.message)).toEqual([
      "unsuppressed",
    ]);
  });

  test("reports missing reasons and unused suppressions", () => {
    const suppressions = findSuppressions("fixture.ts", "// pokayoke-ignore: demo/rule", config);

    expect(validateSuppressions(suppressions, config)).toEqual([
      {
        ruleId: "suppressions/missing-reason",
        severity: "error",
        message: "Suppression is missing a reason.",
        file: "fixture.ts",
        line: 1,
        column: 1,
        advice: 'Use "pokayoke-ignore: demo/rule -- <reason>".',
      },
    ]);
    expect(unusedSuppressionFindings(suppressions, "warn")).toHaveLength(1);
  });
});

describe("baselines", () => {
  test("matches finding keys by rule id", () => {
    expect(isBaselined(finding(10, "baselined"), { "demo/rule": ["fixture.ts:10:1"] })).toBe(true);
  });
});

function finding(line: number, message: string): Finding {
  return {
    ruleId: "demo/rule",
    severity: "error",
    message,
    file: "fixture.ts",
    line,
    column: 1,
  };
}
