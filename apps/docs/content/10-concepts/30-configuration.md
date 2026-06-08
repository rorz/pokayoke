---
title: pokayoke.jsonc
description: Config lookup, local rules, ignores, suppressions, baselines, and workspaces.
---

# Configuration

pokayoke loads one root config file:

```txt
pokayoke.jsonc
```

The config is the human-facing policy surface. Repo-local TypeScript rule code
lives under `.pokayoke/rules`, and the config decides which files are checked
and which rules are enabled.

## Minimal Config

```jsonc
{
  "$schema": "https://pokayoke.dev/schema.json",
  "extends": ["pokayoke/recommended"],
  "localRules": [".pokayoke/rules/**/*.rule.ts"],
  "files": ["AGENTS.md", "README.md", "apps/**/*.ts", "packages/**/*.ts", "package.json"],
  "ignores": ["**/node_modules/**", "**/dist/**", "**/*.d.ts"],
  "rules": {
    "repo/no-root-source-files": "error"
  }
}
```

The `$schema` field is for editor validation. When developing pokayoke itself,
this repository points at `./packages/pokayoke/schema.json` so it can validate
against the local package source.

## `extends`

`extends` enables preset rule settings.

```jsonc
{
  "extends": [
    "pokayoke/recommended",
    "pokayoke/typescript/recommended",
    "pokayoke/package-policy/bun-workspaces"
  ]
}
```

Available built-in presets include:

- `pokayoke/recommended`: file size and unused suppression checks.
- `pokayoke/typescript/recommended`: TypeScript convention checks.
- `pokayoke/package-policy/bun-workspaces`: Bun workspace package policy.

Explicit `rules` entries override preset settings.

See [Rules](/rules) for the exported rule IDs and option shapes.

## `localRules`

`localRules` imports repo-owned rule modules.

```jsonc
{
  "localRules": [".pokayoke/rules/**/*.rule.ts"]
}
```

Every exported value shaped like a rule, with `meta.id` and `run`, is
registered. Use the `.rule.ts` suffix for modules that should be imported
during checks, and keep tests beside the rule files.

## `files` And `ignores`

`files` defines the normal check surface. `ignores` removes files from that
surface.

```jsonc
{
  "files": ["AGENTS.md", "apps/docs/content/**/*.md", "packages/**/*.ts"],
  "ignores": ["**/node_modules/**", "**/dist/**", "**/*.d.ts"]
}
```

Rules can still call `context.glob()` when they need a specific surface outside
the configured `files`, such as generated artifacts or package manifests.

## `rules`

Rule settings use either a severity string or a severity plus options.

```jsonc
{
  "rules": {
    "package/no-npx-in-scripts": "warn",
    "structure/max-file-lines": ["error", { "max": 350 }]
  }
}
```

Valid severities are `off`, `warn`, and `error`.

pokayoke applies the configured severity to findings from that rule. A reusable
rule can return `warn` in its source, but config is the final authority.

## `overrides`

Use `overrides` when a subset of files needs different rule settings.

```jsonc
{
  "overrides": [
    {
      "files": ["apps/docs/content/**/*.md"],
      "rules": {
        "structure/max-file-lines": ["warn", { "max": 220 }]
      }
    }
  ]
}
```

Overrides are useful for docs, generated fixtures, compatibility shims, and
legacy folders. Prefer narrow overrides over broad rule changes.

## `suppressions`

Suppressions configure inline ignore comments.

```jsonc
{
  "suppressions": {
    "directive": "pokayoke-ignore",
    "requireReason": true,
    "reportUnused": "warn"
  }
}
```

Inline suppressions should be local and justified:

```ts
// pokayoke-ignore: typescript/no-forward-reference -- mutual recursion is intentional
```

Use file-level suppressions only near the top of a file:

```ts
// pokayoke-ignore-file: structure/max-file-lines -- generated compatibility shim
```

## `baseline`

Use a baseline when existing violations need to be grandfathered without hiding
debt in rule source.

```jsonc
{
  "baseline": {
    "typescript/no-swallowed-errors": ["apps/web/src/example.ts:42:5"]
  }
}
```

Baseline entries use `findingKey()` shape: `file:line:column` when location
exists, or the closest stable key for findings without source locations.

## `workspaces`

`workspaces` is available for rules that need repo-specific workspace metadata.

```jsonc
{
  "workspaces": {
    ".": {},
    "apps/*": {},
    "packages/*": {}
  }
}
```

Most repositories can rely on `package.json` workspaces. Add explicit metadata
only when a local rule needs it.

## Fix Mode

`pokayoke check --fix` sets `context.fix` for rules. Rules should only write
when their repair is deterministic, such as syncing a generated catalogue from
a live contract.

## Check Output

`pokayoke check` prints a compact `pokayoke PASS` line for a clean pass. When
there are errors or warnings, it expands to the normal findings report.

Use `pokayoke check --verbose` to print the full passing summary. JSON output is
always explicit:

```sh
pokayoke check --format json
```
