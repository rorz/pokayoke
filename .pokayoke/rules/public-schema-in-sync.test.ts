import { describe, expect, test } from "bun:test";

import { publicSchemaInSync } from "./public-schema-in-sync.rule";

describe("docs/public-schema-in-sync", () => {
  test("passes when the public schema matches the package schema", async () => {
    const result = await publicSchemaInSync.run(makeContext("same\n", "same\n"));

    expect(result.findings).toEqual([]);
  });

  test("reports drift when the public schema differs", async () => {
    const result = await publicSchemaInSync.run(makeContext("current\n", "expected\n"));

    expect(result.findings).toEqual([
      {
        ruleId: "docs/public-schema-in-sync",
        severity: "error",
        message: "The public docs schema is out of sync with the package schema.",
        file: "apps/docs/public/schema.json",
        advice:
          "Run bun run dogfood --fix, or run pokayoke check --fix when this rule supports fixes.",
      },
    ]);
  });
});

function makeContext(actual: string, expected: string) {
  return {
    execAdapter: async () => ({ exitCode: 0, stderr: "", stdout: "" }),
    files: async () => [],
    fix: false,
    glob: async () => [],
    options: undefined,
    packageJson: async () => ({}),
    parseTypescript: async () => {
      throw new Error("parseTypescript is not used by this rule.");
    },
    readFile: async (file: string) => {
      if (file === "packages/pokayoke/schema.json") {
        return expected;
      }

      if (file === "apps/docs/public/schema.json") {
        return actual;
      }

      throw new Error(`Unexpected file: ${file}`);
    },
    report: () => {},
    root: "/tmp/pokayoke-public-schema-test",
    workspaces: async () => [],
  };
}
