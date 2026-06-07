---
title: Adapters
description: How existing tools can report through pokayoke.
---

# Adapters

Adapter rules let pokayoke call tools that already own a category of analysis.
The adapter's job is to run the tool, parse or normalize its result, and report
findings through the same reporter as native rules.

Examples:

- `knip`
- `biome`
- `tsc`

Adapters should be first-class rules, not hidden preflight commands.

## Config Shape

```jsonc
{
  "adapters": {
    "knip": [
      "warn",
      {
        "config": "knip.jsonc",
        "args": ["--no-progress"]
      }
    ]
  }
}
```

## Design Rules

- Adapter output should use normal pokayoke severities.
- Adapter failures should include the command, exit code, and stderr excerpt.
- Adapter config should be visible in `pokayoke explain`.
- Adapters should avoid duplicating checks that native rules already own.
- Adapters should never require unrelated packages unless the user enables them.

## Why Not Just Scripts

Scripts can fail, but they do not share config, suppressions, baselines,
reporters, or explanations. Adapters let existing tools participate in the same
policy layer as native rules.
