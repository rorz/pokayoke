---
title: Getting started
description: Set pokayoke up in minutes.
---

# Getting Started

pokayoke turns repo conventions into checks that humans and agents can both
run.

{% callout title="Bun is required" tone="warning" %}
pokayoke currently targets projects that use, or can run, the `bun` runtime.
{% /callout %}

## Agent-First

Install the Codex skill:

```sh
bunx skills add rorz/pokayoke
```

Then prompt your agent with the repo convention you want to make checkable:

```txt
Use the pokayoke skill. Add pokayoke to this Bun repo, run init, append it to
the existing check script, and create a local rule that rejects npx in package
scripts. Add a focused test and run bun run check.
```

Good prompts name the convention, the source of truth, and the verification
command. For example:

```txt
Use the pokayoke skill. Write a rule that keeps generated route docs in sync
with the route files. Support --fix because the generated output is
deterministic. Run bun run check.
```

```txt
Use the pokayoke skill. Check that CLAUDE.md mirrors AGENTS.md. If it drifts,
report the mirror file and tell the agent to update it from AGENTS.md.
```

## Add Pokayoke To Agent Rules

Add a short reference to `AGENTS.md`, `CLAUDE.md`, or your tool's rules folder
so agents know where the policy lives:

```md
This repository uses pokayoke for deterministic repo policy checks.

- Config lives in `pokayoke.jsonc`.
- Local rules live in `.pokayoke/rules/**/*.rule.ts`.
- When changing docs, commands, package policy, generated artifacts, or agent
  instructions, update the matching pokayoke rule or add one.
- Read `/configuration` for config and `/rule-design` for rule examples.
- Run `bun run pokayoke check` or the repo's normal `check` script before
  handoff.
```

Do not point agents at `node_modules` for reference docs. Link them to the docs
site routes or to the repo's own docs source files.

Before an agent hands work back, it should run local rule tests, run
`bun run pokayoke check`, run the repo's normal `check` script, and mention any
rules that are planned but not implemented.

## Human Setup

Run these commands from the repository root:

```sh
bun add --save-dev pokayoke
bun run pokayoke init
bun run pokayoke check
```

`pokayoke init` creates:

```txt
pokayoke.jsonc
.pokayoke/
  rules/
    no-root-source-files.rule.ts
    no-root-source-files.test.ts
```

Existing files are skipped. Use `pokayoke init --force` only when you intend to
regenerate the starter policy files.

## Add It To Checks

Append pokayoke to the existing check gate:

```json
{
  "scripts": {
    "typecheck": "tsc --noEmit",
    "test": "bun test",
    "pokayoke": "pokayoke check",
    "check": "bun run typecheck && bun run test && bun run pokayoke"
  }
}
```

Keep existing type checks, tests, formatting, and dependency checks.

## Better Starter Rules

Start with rules that compare one repo contract with one checkable surface:

- Package scripts must use `bunx` instead of `npx`.
- Internal workspace dependencies must use `workspace:*`.
- Generated docs must match their source files.
- Agent instruction files must mirror `AGENTS.md`.
- Markdown command examples must reference scripts that still exist.
- Environment schema files must require values instead of making them optional.

Read [Configuration](/configuration) for `pokayoke.jsonc`, [Rules](/rules)
for published rule IDs, and [Rule Design](/rule-design) for local rule shape.
