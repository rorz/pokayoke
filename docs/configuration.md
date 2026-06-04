# Configuration

pokayoke supports JSONC config, but the default authoring surface should be
`.pokayoke/config.ts`. Local TypeScript config lets a project keep custom rules
next to the policy that enables them.

Root config files still take priority. Use them when a repo needs an explicit
override or a package wants to publish a plain JSONC policy.

## Lookup Order

1. `pokayoke.config.ts`
2. `pokayoke.config.js`
3. `pokayoke.jsonc`
4. `.pokayoke/config.ts`
5. `.pokayoke/pokayoke.ts`
6. `.pokayoke/pokayoke.jsonc`
7. `.pokayoke.jsonc`
8. `package.json#pokayoke`

## Init

Run:

```sh
pokayoke init
```

The command creates:

```txt
.pokayoke/
  config.ts
  rules/
    no-root-source-files.ts
```

Existing files are skipped by default. Use `pokayoke init --force` only when a
project intentionally wants to regenerate the starter files.

## Example

```ts
import { defineConfig, definePlugin } from "pokayoke";

import { agentInstructionsInSync } from "./rules/agent-instructions-in-sync";

export default defineConfig({
  extends: ["pokayoke/recommended", "@pokayoke/package-policy/bun-workspaces"],
  plugins: [
    definePlugin({
      name: "local",
      rules: {
        [agentInstructionsInSync.meta.id]: agentInstructionsInSync,
      },
    }),
  ],
  files: ["apps/**", "packages/**", "scripts/**"],
  ignores: [
    "**/node_modules/**",
    "**/dist/**",
    "**/*.generated.ts",
    "**/*.d.ts",
  ],
  suppressions: {
    directive: "pokayoke-ignore",
    legacyDirectives: [],
    requireReason: true,
    reportUnused: "warn",
  },
  rules: {
    "agents/instructions-in-sync": "error",
    "typescript/enforce-arrow-function": "error",
    "typescript/no-forward-reference": "error",
    "typescript/no-swallowed-errors": "error",
    "structure/max-file-lines": [
      "warn",
      {
        max: 350,
        ignore: ["**/*.generated.ts", "**/*.d.ts"],
      },
    ],
    "package/catalog": [
      "error",
      {
        catalog: "base",
      },
    ],
  },
  workspaces: {
    ".": {},
    "apps/*": {},
    "packages/*": {},
  },
  adapters: {
    knip: [
      "warn",
      {
        args: ["knip", "--no-progress"],
      },
    ],
  },
});
```

## Rule Settings

Rule settings follow the common shape:

```jsonc
{
  "rules": {
    "package/no-npx-in-scripts": "warn",
    "structure/max-file-lines": ["error", { "max": 350 }]
  }
}
```

Valid severities are `off`, `warn`, and `error`.

## Baselines

Baselines belong in config, not in rule source.

```jsonc
{
  "baseline": {
    "typescript/no-swallowed-errors": ["apps/web/src/example.ts:42:5"]
  }
}
```

That keeps reusable rules clean and makes debt visible to reviewers.
