---
title: Agent rules
description: Checks for stale or drifted agent-facing instructions.
---

# Agent Rules

Agent-facing instructions are part of a repo's executable contract.

If an agent reads stale commands, stale examples, or a stale generated catalogue,
it can fail confidently. pokayoke should make those surfaces checkable without
turning the project into an agent framework.

For setup and the agent instruction snippet, see
[Getting Started](/getting-started).

## What To Check

Useful agent rules usually compare one source of truth with one or more prose
surfaces:

- `SKILL.md` setup and rule design instructions to the current CLI and API.
- CLI contract to agent skill examples.
- API contract to documentation tables.
- Generated operation catalogue to the live operation registry.
- Root agent instructions to mirrored files for other agent tools.
- Package policy to examples that show install or script commands.

## Recommended Shape

Keep project-specific agent rules local:

```txt
pokayoke.jsonc
.pokayoke/
  rules/
    agent-instructions-in-sync.rule.ts
    skill-catalogue-in-sync.rule.ts
    no-phantom-cli-references.rule.ts
```

Then enable them in `pokayoke.jsonc`:

```jsonc
{
  "localRules": [".pokayoke/rules/**/*.rule.ts"],
  "rules": {
    "agents/instructions-in-sync": "error"
  }
}
```

## Rule Design

Agent rules should answer concrete questions:

- Does every command mentioned in an agent instruction file still exist?
- Does a generated catalogue match the source contract?
- Are mirrored instruction files synchronized?
- Does every suppression explain why an exception is safe?

They should also provide direct repair advice:

- Which file drifted.
- Which command or operation is stale.
- Which generator or sync command should be run.
- Whether the fix is to update docs or update the source contract.

## What To Avoid

- Do not bake one repo's private agent workflow into pokayoke core.
- Do not make agents special when normal repo policy is enough.
- Do not let generated catalogues become hand-edited docs.
- Do not hide baselines inside rule source.

The core rule is simple: if an agent will read it before acting, pokayoke should
be able to verify that it still reflects the live repo contract.
