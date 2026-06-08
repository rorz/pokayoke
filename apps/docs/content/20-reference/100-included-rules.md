---
title: Included rules
description: The full list of pre-written rules in pokayoke, and their corresponding identifiers.
---

{% callout title="Use the current presets as a guide" tone="tip" %}
The following presets are subject to change. "Recommended" presets might not work for your repo's current state. If the presets don't work for you, I would recommend instead that you don't start with any presets, and create your own rules.
{% /callout %}

| Preset | Includes |
| --- | --- |
| `pokayoke/recommended` | `structure/max-file-lines`, `suppressions/no-unused` |
| `pokayoke/typescript/recommended` | `typescript/no-forward-reference`, `typescript/no-optional-env`, `typescript/no-swallowed-errors` |
| `pokayoke/package-policy/bun-workspaces` | `package/catalog`, `package/workspace-protocol`, `package/no-npx-in-scripts` |
| `pokayoke/patterns/recommended` | Empty today; reserved for future pattern defaults. |

## pokayoke/recommended

### structure/max-file-lines

| Kind | Enable with |
| --- | --- |
| `project` | `rules` |

Reports files above the configured line limit. The default max is `350`. Use
`ignore` for generated files and narrow intentional exceptions.

### suppressions/no-unused

| Kind | Enable with |
| --- | --- |
| `project` | `rules` |

Reports suppression comments that no longer suppress an active finding. This
keeps old exceptions from becoming invisible policy debt.

## pokayoke/typescript/recommended

### typescript/no-forward-reference

| Kind | Enable with |
| --- | --- |
| `file` | `rules` |

Reports runtime references to top-level values before their declarations. Type
positions and deferred runtime references inside functions are ignored.

### typescript/no-optional-env

| Kind | Enable with |
| --- | --- |
| `file` | `rules` |

Reports optional environment schema entries that lack an explicit justification.
By default it checks `**/src/env.ts` and `**/env.ts`.

### typescript/no-swallowed-errors

| Kind | Enable with |
| --- | --- |
| `file` | `rules` |

Reports empty catch blocks, catch blocks without a bound thrown value, and caught
values that are ignored.

## pokayoke/package-policy/bun-workspaces

### package/catalog

| Kind | Enable with |
| --- | --- |
| `project` | `rules` |

Checks workspace dependencies against the root package catalog. External
dependencies should be declared in the catalog and referenced with `catalog:`.

### package/workspace-protocol

| Kind | Enable with |
| --- | --- |
| `project` | `rules` |

Requires internal workspace dependencies to use a configured protocol. The
default is `workspace:*`.

### package/no-npx-in-scripts

| Kind | Enable with |
| --- | --- |
| `project` | `rules` |

Reports package scripts that call `npx`. Use it when scripts should stay
package-manager consistent, such as preferring `bunx` in Bun workspaces.

## pokayoke/patterns/recommended

No rules today; reserved for future pattern defaults.

## No preset

### patterns/file-must-match

| Kind | Enable with |
| --- | --- |
| `file` | `rules` |

Requires selected files to match configured text or regular expressions. It
accepts `files`, `patterns`, or a single `pattern` shorthand.

### patterns/no-banned-text

| Kind | Enable with |
| --- | --- |
| `file` | `rules` |

Reports configured text or regular expression matches in selected files. Use it
for stale commands, old product names, or deprecated phrases.

### patterns/required-text

| Kind | Enable with |
| --- | --- |
| `file` | `rules` |

Requires configured text or regular expressions to appear in selected files. Use
it for mandatory instructions, ownership notes, generated headers, or links.

### typescript/enforce-arrow-function

| Kind | Enable with |
| --- | --- |
| `file` | `rules` |

Reports TypeScript function declarations when a project requires arrow
functions. Overload declarations are ignored.

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
