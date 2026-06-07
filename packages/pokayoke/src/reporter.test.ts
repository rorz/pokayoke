import { describe, expect, test } from "bun:test";

import { formatStylish } from "./reporter";

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
