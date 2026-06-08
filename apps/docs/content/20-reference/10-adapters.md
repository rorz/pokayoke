---
title: Adapters
description: How existing tools can report through pokayoke.
---

# Adapters

Adapter rules let pokayoke call tools that already own a category of analysis.
They report through the same config, severity, output, suppressions, and
baseline flow as native rules.

Use adapters for tools such as:

- Biome
- Knip
- TypeScript

## Config Shape

Adapter keys are written without the `adapter/` prefix. pokayoke maps them to
registered adapter rule IDs.

```jsonc
{
  "adapters": {
    "biome": ["error", { "args": ["biome", "ci", "."] }],
    "knip": ["warn", { "args": ["knip", "--strict", "--no-progress"] }]
  }
}
```

The built-in adapter command is `bunx`. If you provide `args`, include the tool
name as the first argument.

## When To Use One

Use an adapter when the external tool is already the right source of truth.
Examples:

- Biome owns formatting and import sorting.
- Knip owns unused files, exports, and dependencies.
- TypeScript owns type errors.

Use a native pokayoke rule when the policy is specific to the repo.

## Adapter Findings

Adapter findings should include:

- the command that ran
- the exit code
- the relevant stdout or stderr excerpt
- repair advice when the tool output is not enough

Adapters should be visible and reviewable. Do not hide important policy in
preflight scripts that run outside pokayoke.
