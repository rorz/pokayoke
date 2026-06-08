import { describe, expect, test } from "bun:test";

import { formatCheckOutput, formatStylish } from "./reporter";

describe("formatStylish", () => {
  test("renders a clear passing summary without color", () => {
    expect(
      formatStylish(
        {
          configPath: "pokayoke.jsonc",
          files: ["package.json"],
          findings: [],
          rulesRun: ["package/no-npx-in-scripts"],
        },
        { color: false, width: 24 },
      ),
    ).toContain("========================\n🧩  pokayoke PASS\n========================");
  });
});

describe("formatCheckOutput", () => {
  const passingResult = {
    configPath: "pokayoke.jsonc",
    files: ["package.json"],
    findings: [],
    rulesRun: ["package/no-npx-in-scripts"],
  };

  test("stays quiet for a clean stylish pass by default", () => {
    expect(formatCheckOutput(passingResult, { color: false, width: 24 })).toBe("");
  });

  test("renders a clean stylish pass in verbose mode", () => {
    expect(formatCheckOutput(passingResult, { color: false, verbose: true, width: 24 })).toContain(
      "pokayoke PASS",
    );
  });

  test("keeps json output explicit for a clean pass", () => {
    expect(formatCheckOutput(passingResult, { format: "json" })).toContain('"findings": []');
  });

  test("renders warnings even when the check has no errors", () => {
    expect(
      formatCheckOutput(
        {
          ...passingResult,
          findings: [
            {
              ruleId: "demo/warn",
              severity: "warn",
              message: "This should remain visible.",
              file: "package.json",
            },
          ],
        },
        { color: false, width: 24 },
      ),
    ).toContain("This should remain visible.");
  });
});
