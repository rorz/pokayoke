import { describe, expect, test } from "bun:test";

import { canonicalDocsSource } from "./canonical-docs-source.rule";

describe("docs/canonical-source", () => {
  test("reports legacy root docs, stale links, and external markdown imports", async () => {
    const files = new Map([
      ["README.md", "See docs/configuration.md.\n"],
      ["AGENTS.md", "Use apps/docs/content for docs.\n"],
      [
        "apps/docs/lib/docs.ts",
        [
          'import content from "../../../docs/configuration.md?raw";',
          'const docs = import.meta.glob<string>("../../../docs/**/*.md", { eager: true });',
        ].join("\n"),
      ],
    ]);

    const result = await canonicalDocsSource.run({
      execAdapter: async () => ({ exitCode: 0, stderr: "", stdout: "" }),
      files: async () => [],
      fix: false,
      glob: async (patterns) => {
        const list = Array.isArray(patterns) ? patterns : [patterns];

        if (list.includes("docs/**/*")) {
          return ["docs/configuration.md"];
        }

        if (list.includes("apps/docs/**/*.ts")) {
          return ["apps/docs/lib/docs.ts"];
        }

        return [];
      },
      options: undefined,
      packageJson: async () => ({}),
      parseTypescript: async () => {
        throw new Error("parseTypescript is not used by this rule.");
      },
      readFile: async (file) => files.get(file) ?? "",
      report: () => {},
      root: "/tmp/pokayoke-canonical-docs-test",
      workspaces: async () => [],
    });

    expect(result.findings.map((finding) => finding.message)).toEqual([
      "Root docs files are not canonical in this repository.",
      "Top-level guidance links to the old root docs directory.",
      "The docs app imports markdown from outside its canonical content tree.",
      "The docs app globs markdown from outside its canonical content tree.",
    ]);
  });

  test("allows docs app content imports, globs, and root route links", async () => {
    const files = new Map([
      ["README.md", "Read /configuration for config docs.\n"],
      ["AGENTS.md", "Use apps/docs/content for docs.\n"],
      [
        "apps/docs/lib/docs.ts",
        [
          'import content from "../content/20-reference/00-configuration.md?raw";',
          'const docs = import.meta.glob<string>("../content/**/*.md", { eager: true });',
        ].join("\n"),
      ],
    ]);

    const result = await canonicalDocsSource.run({
      execAdapter: async () => ({ exitCode: 0, stderr: "", stdout: "" }),
      files: async () => [],
      fix: false,
      glob: async (patterns) => {
        const list = Array.isArray(patterns) ? patterns : [patterns];

        if (list.includes("apps/docs/**/*.ts")) {
          return ["apps/docs/lib/docs.ts"];
        }

        return [];
      },
      options: undefined,
      packageJson: async () => ({}),
      parseTypescript: async () => {
        throw new Error("parseTypescript is not used by this rule.");
      },
      readFile: async (file) => files.get(file) ?? "",
      report: () => {},
      root: "/tmp/pokayoke-canonical-docs-test",
      workspaces: async () => [],
    });

    expect(result.findings).toEqual([]);
  });
});
