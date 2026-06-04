# Agent Setup

This page is for agents adding pokayoke to a repository.

The goal is simple: create a local policy folder, register any repo-specific
rules, add scripts, and run the checks before handing work back.

## Quick Start

Run:

```sh
bun add -d pokayoke
bun run pokayoke init
```

If the package manager is not Bun, use the repo's package manager and keep the
same shape:

```sh
pokayoke init
```

The init command creates:

```txt
.pokayoke/
  config.ts
  rules/
    no-root-source-files.ts
    no-root-source-files.test.ts
```

Existing files are skipped. Use `pokayoke init --force` only when the user asks
to regenerate the starter policy files.

## Add Scripts

Add scripts that match the repo's package manager:

```json
{
  "scripts": {
    "pokayoke": "pokayoke check",
    "check": "tsc --noEmit && pokayoke check"
  }
}
```

For Bun workspaces, prefer:

```json
{
  "scripts": {
    "pokayoke": "bun run pokayoke check",
    "check": "bun run typecheck && bun run pokayoke"
  }
}
```

Keep existing `check` behavior. Append pokayoke to the gate instead of replacing
tests, type checks, or format checks.

## Configure Local Rules

Use `.pokayoke/config.ts` for project-specific policy:

```ts
import { defineConfig, definePlugin } from "pokayoke";

import { agentInstructionsInSync } from "./rules/agent-instructions-in-sync";

export default defineConfig({
  plugins: [
    definePlugin({
      name: "local",
      rules: {
        [agentInstructionsInSync.meta.id]: agentInstructionsInSync,
      },
    }),
  ],
  files: ["AGENTS.md", "docs/**/*.md", "packages/**/*.ts", "package.json"],
  ignores: ["**/node_modules/**", "**/dist/**"],
  rules: {
    "agents/instructions-in-sync": "error",
  },
});
```

Write local rules in `.pokayoke/rules`. Keep them small and explicit.
Add or keep a nearby test for every rule.

## Agent Instruction Rails

Agent-facing files drift easily. Good pokayoke rules for agents usually check:

- Root `SKILL.md` instructions stay current with the actual pokayoke CLI and
  rule API.
- Mirrored instruction files stay synchronized.
- Generated catalogues match the live command or API contract.
- Command examples in prose resolve to real commands.
- Docs mention new public operations when contracts grow.
- Suppressions include a reason.

Use `AGENTS.md` as the source of truth when the repo has several agent files,
unless the user specifies a different source.

## Handoff Checklist

Before finishing setup:

- Run `pokayoke check`.
- Run the local rule tests.
- Run the repo's normal `check` script.
- Confirm `.pokayoke/config.ts` loads successfully.
- Confirm local rules live under `.pokayoke/rules`.
- Confirm `SKILL.md` tells agents how to configure pokayoke and author rules.
- Confirm generated or mirrored agent docs have a clear source of truth.
- Mention any rules that are placeholders rather than implemented checks.

If a policy is only an idea, document it as a planned rule. Do not enable a fake
rule that always passes unless it is clearly marked as scaffolding.
