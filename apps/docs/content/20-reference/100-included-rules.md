---
title: Included rules
description: Published presets and built-in rule IDs.
---

This page lists the rules and presets available from the published `pokayoke`
package.

Use presets in `extends`. Enable individual rules in `rules`. Configure adapter
rules through `adapters` without the `adapter/` prefix.

## Presets

| Preset | Includes |
| --- | --- |
| `pokayoke/recommended` | `structure/max-file-lines`, `suppressions/no-unused` |
| `pokayoke/typescript/recommended` | `typescript/no-forward-reference`, `typescript/no-optional-env`, `typescript/no-swallowed-errors` |
| `pokayoke/package-policy/bun-workspaces` | `package/catalog`, `package/workspace-protocol`, `package/no-npx-in-scripts` |
| `pokayoke/patterns/recommended` | Empty today; reserved for future pattern defaults. |

## Built-In Rules

### adapter/biome

| Kind | Enable with | Preset |
| --- | --- | --- |
| `adapter` | `adapters.biome` | none |

Runs Biome through pokayoke and reports formatter, import sorting, and lint
findings. The default command is `bunx biome ci .`.

### adapter/knip

| Kind | Enable with | Preset |
| --- | --- | --- |
| `adapter` | `adapters.knip` | none |

Runs Knip through pokayoke and reports unused dependency, export, and file
findings. The default command is `bunx knip --strict --no-progress`.

### package/catalog

| Kind | Enable with | Preset |
| --- | --- | --- |
| `project` | `rules` | `pokayoke/package-policy/bun-workspaces` |

Checks workspace dependencies against the root package catalog. External
dependencies should be declared in the catalog and referenced with `catalog:`.

### package/no-npx-in-scripts

| Kind | Enable with | Preset |
| --- | --- | --- |
| `project` | `rules` | `pokayoke/package-policy/bun-workspaces` |

Reports package scripts that call `npx`. Use it when scripts should stay
package-manager consistent, such as preferring `bunx` in Bun workspaces.

### package/workspace-protocol

| Kind | Enable with | Preset |
| --- | --- | --- |
| `project` | `rules` | `pokayoke/package-policy/bun-workspaces` |

Requires internal workspace dependencies to use a configured protocol. The
default is `workspace:*`.

### patterns/file-must-match

| Kind | Enable with | Preset |
| --- | --- | --- |
| `file` | `rules` | none |

Requires selected files to match configured text or regular expressions. It
accepts `files`, `patterns`, or a single `pattern` shorthand.

### patterns/no-banned-text

| Kind | Enable with | Preset |
| --- | --- | --- |
| `file` | `rules` | none |

Reports configured text or regular expression matches in selected files. Use it
for stale commands, old product names, or deprecated phrases.

### patterns/required-text

| Kind | Enable with | Preset |
| --- | --- | --- |
| `file` | `rules` | none |

Requires configured text or regular expressions to appear in selected files. Use
it for mandatory instructions, ownership notes, generated headers, or links.

### structure/max-file-lines

| Kind | Enable with | Preset |
| --- | --- | --- |
| `project` | `rules` | `pokayoke/recommended` |

Reports files above the configured line limit. The default max is `350`. Use
`ignore` for generated files and narrow intentional exceptions.

### suppressions/no-unused

| Kind | Enable with | Preset |
| --- | --- | --- |
| `project` | `rules` | `pokayoke/recommended` |

Reports suppression comments that no longer suppress an active finding. This
keeps old exceptions from becoming invisible policy debt.

### typescript/enforce-arrow-function

| Kind | Enable with | Preset |
| --- | --- | --- |
| `file` | `rules` | none |

Reports TypeScript function declarations when a project requires arrow
functions. Overload declarations are ignored.

### typescript/no-forward-reference

| Kind | Enable with | Preset |
| --- | --- | --- |
| `file` | `rules` | `pokayoke/typescript/recommended` |

Reports runtime references to top-level values before their declarations. Type
positions and deferred runtime references inside functions are ignored.

### typescript/no-optional-env

| Kind | Enable with | Preset |
| --- | --- | --- |
| `file` | `rules` | `pokayoke/typescript/recommended` |

Reports optional environment schema entries that lack an explicit justification.
By default it checks `**/src/env.ts` and `**/env.ts`.

### typescript/no-swallowed-errors

| Kind | Enable with | Preset |
| --- | --- | --- |
| `file` | `rules` | `pokayoke/typescript/recommended` |

Reports empty catch blocks, catch blocks without a bound thrown value, and caught
values that are ignored.

## Options

Use tuple settings for rule options:

```jsonc
{
  "rules": {
    "structure/max-file-lines": ["warn", { "max": 350 }],
    "package/workspace-protocol": ["error", { "protocol": "workspace:*" }],
    "typescript/no-optional-env": ["warn", { "files": ["apps/**/src/env.ts"] }]
  }
}
```

Pattern rules accept `files` and `patterns`; `patterns/file-must-match` also
accepts a single `pattern` shorthand.
