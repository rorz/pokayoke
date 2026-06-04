import { defineConfig, definePlugin } from "pokayoke";

import { agentInstructionsInSync } from "./rules/agent-instructions-in-sync";
import { noRootSourceFiles } from "./rules/no-root-source-files";

export default defineConfig({
  extends: ["pokayoke/recommended", "@pokayoke/package-policy/bun-workspaces"],
  plugins: [
    definePlugin({
      name: "local",
      rules: {
        [agentInstructionsInSync.meta.id]: agentInstructionsInSync,
        [noRootSourceFiles.meta.id]: noRootSourceFiles,
      },
    }),
  ],
  files: [
    ".pokayoke/**/*.ts",
    "AGENTS.md",
    "CLAUDE.md",
    "README.md",
    "docs/**/*.md",
    "examples/**/*.jsonc",
    "examples/**/*.ts",
    "packages/**/*.json",
    "packages/**/*.ts",
    "package.json",
    "tsconfig.json",
    "biome.jsonc",
    "knip.jsonc",
  ],
  ignores: ["**/node_modules/**", "**/dist/**", "**/*.d.ts"],
  suppressions: {
    directive: "pokayoke-ignore",
    legacyDirectives: [],
    requireReason: true,
    reportUnused: "warn",
  },
  rules: {
    "agents/instructions-in-sync": "error",
    "repo/no-root-source-files": "error",
    "structure/max-file-lines": ["error", { max: 220, ignore: ["docs/configuration.md"] }],
    "package/no-npx-in-scripts": "error",
    "package/workspace-protocol": ["error", { protocol: "workspace:*" }],
  },
  adapters: {
    biome: ["error", { args: ["biome", "ci", "."] }],
    knip: [
      "error",
      {
        args: [
          "knip",
          "--strict",
          "--no-progress",
          "--treat-config-hints-as-errors",
          "--treat-tag-hints-as-errors",
        ],
      },
    ],
  },
});
