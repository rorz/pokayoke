import { describe, expect, test } from "bun:test";

import {
  expectedPublishedPresetNames,
  expectedPublishedRuleIds,
  publishedRulesDocumented,
} from "./published-rules-documented.rule";

describe("docs/published-rules-documented", () => {
  test("passes when every published rule and preset is documented", async () => {
    const result = await publishedRulesDocumented.run(makeContext(completeReference()));

    expect(result.findings).toEqual([]);
  });

  test("reports missing rule sections and presets", async () => {
    const result = await publishedRulesDocumented.run(makeContext("# Rules\n"));

    expect(result.findings.some((finding) => finding.message.includes("missing"))).toBe(true);
  });
});

function completeReference(): string {
  return [
    "# Rules",
    "",
    "## Presets",
    ...expectedPublishedPresetNames().map((preset) => `- \`${preset}\``),
    "",
    "## Built-In Rules",
    ...expectedPublishedRuleIds().map((rule) => `### ${rule}\n`),
  ].join("\n");
}

function makeContext(source: string) {
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
      if (file === "apps/docs/content/20-reference/05-rules.md") {
        return source;
      }

      throw new Error(`Unexpected file: ${file}`);
    },
    report: () => {},
    root: "/tmp/pokayoke-published-rules-test",
    workspaces: async () => [],
  };
}
