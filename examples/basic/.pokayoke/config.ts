import { defineConfig } from "pokayoke";

export default defineConfig({
  extends: ["pokayoke/recommended", "@pokayoke/package-policy/bun-workspaces"],
  files: ["packages/**/*.ts", "packages/**/*.json", "package.json"],
  ignores: ["**/node_modules/**", "**/dist/**", "**/*.d.ts"],
  suppressions: {
    directive: "pokayoke-ignore",
    legacyDirectives: [],
    requireReason: true,
    reportUnused: "warn",
  },
  rules: {
    "structure/max-file-lines": ["warn", { max: 350 }],
    "package/no-npx-in-scripts": "warn",
    "package/workspace-protocol": ["error", { protocol: "workspace:*" }],
  },
});
