import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";

import { runCheck } from "./engine";

describe("local rules", () => {
  test("loads exported rule values from configured localRules globs", async () => {
    const root = await mkdtemp(`${tmpdir()}/pokayoke-local-rules-`);
    await writeLocalRuleProject(root);

    const result = await runCheck({ root });

    expect(result.rulesRun).toEqual(["repo/local-rule"]);
    expect(result.findings).toEqual([
      {
        file: "package.json",
        message: "Local rule loaded.",
        ruleId: "repo/local-rule",
        severity: "error",
      },
    ]);
  });

  test("does not import local rule test files during checks", async () => {
    const root = await mkdtemp(`${tmpdir()}/pokayoke-local-rules-`);
    await writeLocalRuleProject(root);
    await Bun.write(
      `${root}/.pokayoke/rules/local-rule.test.ts`,
      'throw new Error("local rule tests must not be imported during checks");\n',
    );

    const result = await runCheck({ root });

    expect(result.findings).toHaveLength(1);
  });
});

async function writeLocalRuleProject(root: string): Promise<void> {
  await mkdir(`${root}/.pokayoke/rules`, { recursive: true });
  await Bun.write(`${root}/package.json`, '{"name":"fixture"}\n');
  await Bun.write(
    `${root}/pokayoke.jsonc`,
    `{
      "localRules": [".pokayoke/rules/**/*.rule.ts"],
      "files": ["package.json"],
      "rules": {
        "repo/local-rule": "error"
      }
    }\n`,
  );
  await Bun.write(
    `${root}/.pokayoke/rules/local-rule.rule.ts`,
    `export const localRule = {
      meta: {
        id: "repo/local-rule",
        docs: "Fixture local rule.",
        kind: "project",
      },
      async run() {
        return {
          findings: [
            {
              ruleId: "repo/local-rule",
              severity: "error",
              message: "Local rule loaded.",
              file: "package.json",
            },
          ],
        };
      },
    };\n`,
  );
}
