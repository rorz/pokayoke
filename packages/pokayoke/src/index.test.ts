import { describe, expect, test } from "bun:test";

import {
  configLookupOrder,
  isEnabledSeverity,
  normalizeRuleSetting,
  parseJsonc,
  renderProjectSummary,
  ruleKinds,
  runCheck,
} from "./index";

describe("pokayoke core", () => {
  test("models the three rule kinds", () => {
    expect(ruleKinds).toEqual(["file", "project", "adapter"]);
  });

  test("normalizes scalar and tuple rule settings", () => {
    expect(normalizeRuleSetting("warn")).toEqual({ severity: "warn" });
    expect(normalizeRuleSetting(["error", { max: 350 }])).toEqual({
      severity: "error",
      options: { max: 350 },
    });
  });

  test("recognizes enabled severities", () => {
    expect(isEnabledSeverity("off")).toBe(false);
    expect(isEnabledSeverity("warn")).toBe(true);
    expect(isEnabledSeverity("error")).toBe(true);
  });

  test("renders a summary with the config file", () => {
    const summary = renderProjectSummary();
    const firstTarget = configLookupOrder.at(0);

    expect(summary).toContain("pokayoke");
    expect(summary).toContain("Rule kinds:");
    expect(summary).toContain("Config file:");
    expect(firstTarget).toBeDefined();
    expect(summary).toContain(firstTarget ?? "");
  });

  test("parses JSONC config text", () => {
    expect(
      parseJsonc(`{
        // comments are allowed
        "rules": {
          "package/no-npx-in-scripts": "error",
        },
      }`),
    ).toEqual({
      rules: {
        "package/no-npx-in-scripts": "error",
      },
    });
  });

  test("exports a check runner", () => {
    expect(typeof runCheck).toBe("function");
  });
});
