import { describe, expect, test } from "bun:test";

import { parseTypescriptSource } from "../../ast";
import type { AdapterResult, Finding, Rule, RuleContext } from "../../types";

import { enforceArrowFunction, noForwardReference, noOptionalEnv, noSwallowedErrors } from ".";

describe("pokayoke/typescript", () => {
  test("detects function declarations when arrow functions are required", async () => {
    expect(await runRule(enforceArrowFunction, "function nope() { return 1; }")).toHaveLength(1);
    expect(await runRule(enforceArrowFunction, "const yep = () => 1;\nfunction* gen() {}")).toEqual(
      [],
    );
  });

  test("detects same-file forward references", async () => {
    expect(
      await runRule(noForwardReference, "const value = later;\nconst later = 1;"),
    ).toHaveLength(1);
    expect(await runRule(noForwardReference, "const later = 1;\nconst value = later;")).toEqual([]);
  });

  test("detects swallowed catch blocks", async () => {
    expect(
      await runRule(noSwallowedErrors, "try {} catch { console.log('fallback'); }"),
    ).toHaveLength(1);
    expect(
      await runRule(noSwallowedErrors, "try {} catch (error) { console.error(error); }"),
    ).toEqual([]);
  });

  test("detects optional env schemas in env files", async () => {
    expect(
      await runRule(
        noOptionalEnv,
        "export const env = { OPTIONAL_KEY: z.string().optional() };",
        "src/env.ts",
      ),
    ).toHaveLength(1);
    expect(
      await runRule(noOptionalEnv, "export const env = { REQUIRED_KEY: z.string().min(1) };"),
    ).toEqual([]);
  });

  test("supports custom env schema file globs", async () => {
    expect(
      await runRule(
        noOptionalEnv,
        "export const env = { OPTIONAL_KEY: z.string().optional() };",
        "config/schema.ts",
        { files: ["config/*.ts"] },
      ),
    ).toHaveLength(1);
    expect(
      await runRule(
        noOptionalEnv,
        "export const env = { OPTIONAL_KEY: z.string().optional() };",
        "config/schema.ts",
      ),
    ).toEqual([]);
  });
});

async function runRule(
  rule: Rule,
  source: string,
  file = "fixture.ts",
  options?: unknown,
): Promise<Finding[]> {
  const reported: Finding[] = [];
  const context: RuleContext = {
    execAdapter: async (): Promise<AdapterResult> => ({
      exitCode: 0,
      stderr: "",
      stdout: "",
    }),
    files: async () => [file],
    fix: false,
    glob: async () => [file],
    options,
    packageJson: async () => ({}),
    parseTypescript: async () => parseTypescriptSource(file, source),
    readFile: async () => source,
    report: (finding) => {
      reported.push(finding);
    },
    root: ".",
    workspaces: async () => [],
  };
  const result = await rule.run(context);

  return [...reported, ...result.findings];
}
