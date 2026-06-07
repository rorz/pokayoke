import { mkdir } from "node:fs/promises";

export type InitOptions = {
  root?: string;
  force?: boolean;
};

export type InitFileResult = {
  path: string;
  status: "created" | "skipped";
};

export type InitResult = {
  files: InitFileResult[];
};

const files = {
  "pokayoke.jsonc": `{
  "$schema": "./node_modules/pokayoke/schema.json",
  "extends": ["pokayoke/recommended"],
  "localRules": [".pokayoke/rules/**/*.rule.ts"],
  "files": ["AGENTS.md", "SKILL.md", "README.md", "apps/docs/content/**/*.md", "packages/**/*.json", "packages/**/*.ts", "package.json"],
  "ignores": ["**/node_modules/**", "**/dist/**", "**/*.d.ts"],
  "suppressions": {
    "directive": "pokayoke-ignore",
    "requireReason": true,
    "reportUnused": "warn"
  },
  "rules": {
    "repo/no-root-source-files": "error",
    "structure/max-file-lines": ["error", { "max": 350 }]
  }
}
`,
  ".pokayoke/rules/no-root-source-files.rule.ts": `import type { Rule } from "pokayoke";

export const noRootSourceFiles: Rule = {
  meta: {
    id: "repo/no-root-source-files",
    docs: "Keep source files inside packages instead of a root src folder.",
    kind: "project",
  },
  async run(context) {
    const findings = [];

    const rootSourceFiles = await context.glob([
      "src/**/*.ts",
      "src/**/*.tsx",
      "src/**/*.js",
      "src/**/*.jsx",
    ]);

    for (const file of rootSourceFiles) {
      findings.push({
        ruleId: "repo/no-root-source-files",
        severity: "error" as const,
        message: "Root source files are not allowed in this workspace.",
        file,
        advice: "Move source code into a package or remove the stale root src file.",
      });
    }

    return { findings };
  },
};
`,
  ".pokayoke/rules/no-root-source-files.test.ts": `import { describe, expect, test } from "bun:test";
import { mkdir, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";

import { noRootSourceFiles } from "./no-root-source-files.rule";

describe("repo/no-root-source-files", () => {
  test("reports source files at the repository root", async () => {
    const root = await mkdtemp(\`\${tmpdir()}/pokayoke-local-rule-\`);

    await mkdir(\`\${root}/src\`, { recursive: true });
    await Bun.write(\`\${root}/src/index.ts\`, "export const value = 1;\\n");

    const result = await noRootSourceFiles.run({
      execAdapter: async () => ({ exitCode: 0, stderr: "", stdout: "" }),
      files: async () => [],
      fix: false,
      glob: async () => ["src/index.ts"],
      options: undefined,
      packageJson: async () => ({}),
      parseTypescript: async () => {
        throw new Error("parseTypescript is not used by this rule.");
      },
      readFile: async () => "",
      report: () => {},
      root,
      workspaces: async () => [],
    });

    expect(result.findings).toHaveLength(1);
    expect(result.findings[0]?.file).toBe("src/index.ts");
  });
});
`,
};

export async function initProject(options: InitOptions = {}): Promise<InitResult> {
  const root = options.root ?? process.cwd();
  const results: InitFileResult[] = [];

  await mkdir(`${root}/.pokayoke/rules`, { recursive: true });

  for (const [path, content] of Object.entries(files)) {
    const target = `${root}/${path}`;
    const exists = await Bun.file(target).exists();

    if (exists && !options.force) {
      results.push({ path, status: "skipped" });
      continue;
    }

    await Bun.write(target, content);
    results.push({ path, status: "created" });
  }

  return { files: results };
}
