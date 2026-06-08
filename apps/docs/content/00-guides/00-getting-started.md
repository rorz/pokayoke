---
title: Getting started
description: Set pokayoke up in minutes.
---

# Getting Started

You can try pokayoke out in an existing codebase easily. Run setup autonomously with the agent `SKILL.md`, or run a few commands manually.

{% callout title="pokayoke is in alpha" tone="caution" %}
As pokayoke is currently in an experimental state, things might change in unexpected or fundamental ways in the near future. I'll do my best to reduce breaking changes!
{% /callout %}

{% callout title="Bun is required" tone="warning" %}
Pokayoke currently targets projects that use, or can run, the `bun` runtime.
{% /callout %}

## Agent-first

Install the agent skill:

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

## Human setup

Run these commands from the root of your codebase:

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
    *.rule.ts
    *.test.ts
```


### Append pokayoke to your checks scripting

In your `package.json` file:

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

### Optional: Add pokayoke to agent rules

If you're using a coding assistant, add a reference to pokayoke in your `AGENTS.md` or your tool's rules folder.

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

## Writing rules

Pokayoke is designed to be unopinionated, and you should ask your coding assistant to create new rules for you as needed. Some starter rules you can try out are:

- "Agent instruction files must mirror `AGENTS.md`"
- "Package scripts must use `bunx` instead of `npx`"
- "All dependencies in this workspace should use a central `catalog` definition"
- "Generated docs must match their source files"

More information on creating rules can [be found here.](/rule-design)

Pokayoke ships with its own rules, which [are documented here.](/included-rules)
