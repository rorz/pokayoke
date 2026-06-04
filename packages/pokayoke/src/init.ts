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
  ".pokayoke/config.ts": `import { defineConfig, definePlugin } from "pokayoke";

import { noRootSourceFiles } from "./rules/no-root-source-files";

export default defineConfig({
  extends: ["pokayoke/recommended", "@pokayoke/package-policy/bun-workspaces"],
  plugins: [
    definePlugin({
      name: "local",
      rules: {
        [noRootSourceFiles.meta.id]: noRootSourceFiles,
      },
    }),
  ],
  files: ["README.md", "docs/**/*.md", "packages/**/*.json", "packages/**/*.ts", "package.json"],
  ignores: ["**/node_modules/**", "**/dist/**", "**/*.d.ts"],
  suppressions: {
    directive: "pokayoke-ignore",
    legacyDirectives: [],
    requireReason: true,
    reportUnused: "warn",
  },
  rules: {
    "repo/no-root-source-files": "error",
    "structure/max-file-lines": ["error", { max: 350 }],
    "package/no-npx-in-scripts": "error",
    "package/workspace-protocol": ["error", { protocol: "workspace:*" }],
  },
});
`,
  ".pokayoke/rules/no-root-source-files.ts": `import { defineRule } from "pokayoke";

export const noRootSourceFiles = defineRule({
  meta: {
    id: "repo/no-root-source-files",
    docs: "Keep source files inside packages instead of a root src folder.",
    kind: "project",
  },
  async run(context) {
    const findings = [];
    const patterns = ["src/**/*.ts", "src/**/*.tsx", "src/**/*.js", "src/**/*.jsx"];

    for (const pattern of patterns) {
      const glob = new Bun.Glob(pattern);

      for await (const file of glob.scan({ cwd: context.root, onlyFiles: true })) {
        findings.push({
          ruleId: "repo/no-root-source-files",
          severity: "error" as const,
          message: "Root source files are not allowed in this workspace.",
          file,
          advice: "Move source code into a package or remove the stale root src file.",
        });
      }
    }

    return { findings };
  },
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
