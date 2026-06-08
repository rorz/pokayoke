---
title: Configuration
description: Config lookup, local rules, ignores, suppressions, and presets.
---

# Configuration

pokayoke uses one root config file: `pokayoke.jsonc`.

The root config is the human-facing policy surface. Repo-local TypeScript rule
code lives under `.pokayoke/`, which is agent-maintained but human-reviewable.

## Config File

The CLI only loads:

```txt
pokayoke.jsonc
```

## Init

Run:

```sh
pokayoke init
```

The command creates:

```txt
pokayoke.jsonc
.pokayoke/
  rules/
    no-root-source-files.rule.ts
    no-root-source-files.test.ts
```

Existing files are skipped by default. Use `pokayoke init --force` only when a
project intentionally wants to regenerate the starter files.

## Example

```jsonc
{
  "$schema": "./node_modules/pokayoke/schema.json",
  "extends": [
    "pokayoke/recommended",
    "pokayoke/typescript/recommended",
    "pokayoke/package-policy/bun-workspaces"
  ],
  "localRules": [".pokayoke/rules/**/*.rule.ts"],
  "files": ["apps/**", "packages/**", "scripts/**"],
  "ignores": [
    "**/node_modules/**",
    "**/dist/**",
    "**/*.generated.ts",
    "**/*.d.ts"
  ],
  "suppressions": {
    "directive": "pokayoke-ignore",
    "requireReason": true,
    "reportUnused": "warn"
  },
  "rules": {
    "agents/instructions-in-sync": "error",
    "typescript/enforce-arrow-function": "error",
    "typescript/no-forward-reference": "error",
    "typescript/no-optional-env": [
      "warn",
      {
        "files": ["apps/**/src/env.ts", "packages/**/src/env.ts"]
      }
    ],
    "typescript/no-swallowed-errors": "error",
    "structure/max-file-lines": [
      "warn",
      {
        "max": 350,
        "ignore": ["**/*.generated.ts", "**/*.d.ts"]
      }
    ],
    "package/catalog": "error"
  },
  "workspaces": {
    ".": {},
    "apps/*": {},
    "packages/*": {}
  },
  "adapters": {
    "knip": [
      "warn",
      {
        "args": ["knip", "--no-progress"]
      }
    ]
  }
}
```

Files matched by `localRules` are imported by pokayoke at check time. Every
exported value shaped like a rule, with `meta.id` and `run`, is registered under
the local rule set.

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

`pokayoke/typescript/recommended` includes `typescript/no-forward-reference`,
`typescript/no-optional-env`, and `typescript/no-swallowed-errors`. The env rule
checks `**/src/env.ts` and `**/env.ts` by default; pass `files` when a project
keeps its environment schema somewhere else.

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

## Fix Mode

`pokayoke check --fix` sets `context.fix` for rules. Rules should only write
when their own repair is deterministic, such as syncing a generated catalogue
from a live contract.

## Check Output

`pokayoke check` prints findings when there are errors or warnings. A clean pass
is quiet by default so the command works well inside larger check scripts.

Use `pokayoke check --verbose` to print the full passing summary. JSON output is
always explicit:

```sh
pokayoke check --format json
```
