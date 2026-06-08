---
title: Why pokayoke
description: Some exposition on the rationale behind pokayoke's development.
---

Developers already have good tools for many code quality attributes. [ESLint](https://eslint.org/) is good at file-local syntax, style, and quality. [Biome](https://biomejs.dev) is great for formatting. [Knip](https://knip.dev) is good at managing project clutter and reachability.

However, a large class of more nebulous issues -- **repo conventions** -- often go unmaintained or are not automated because, by virtue of being specific conventions for a repository, they are harder to mold around opinionated tooling. Pokayoke aims to solve this by providing an unopinionated and extensible system for organizing custom repo-specific TypeScript logic.

**Think of pokayoke as a tool to create deterministic guardrails for common pitfalls or established conventions.**

### A tool for an agent-first world

Just as with humans, agents use code quality and analysis tooling in order to check their work and try to stay away from bugs. It is becoming a common practice with coding assistants to have a `check` command in `package.json` scripting.

`AGENTS.md` and `*/rules/*.md` files are _supposed_ to cover the remaining surface area for agents to keep themselves inline with repo documentation and conventions. However, because agents are stochastic by nature, it is not guaranteed that a convention in these rule files will be adhered to. The way to solve this problem is to **make recurrent pitfalls checkable deterministically.** 

Humans are stochastic by nature too, as much as we might not want to admit it! Bigger teams historically solved the problem of repo convention adherence by creating their own custom scripting and tooling that ran alongside conventional tooling.

> In Japanese, _poka-yoke_ means ["mistake-proofing" or "error-prevention".](https://en.wikipedia.org/wiki/Poka-yoke) It's a mechanic used -- for example -- in the design of the single-orientation USB-A and HDMI connectors.

Pokayoke is a tool for your repository that allows you to define arbitrary scripts, written in TypeScript, that can run against any or all of your codebase. It's fully-usable by humans, but realistically (and especially because it encourages traversing the TypeScript abstract syntax tree) it is designed to be used by agents under human instruction.

## Guardrail examples

Good pokayoke rules usually look like this:

- "This generated file must match that source of truth."
- "This package must use the workspace protocol for internal dependencies."
- "This agent instruction file must not mention commands that no longer exist."
- "This environment file must require values instead of making them optional."
- "This architectural boundary must not point backwards."

These are not always elegant ESLint rules. Some need the whole repo. Some need
package metadata. Some need generated artifacts. Pokayoke's job is to turn those conventions into checks that are easy to run and hard to misunderstand.

## Design goals

The design goals of pokayoke are to:

1. Support the creation of deterministic guardrails
2. Keep one, simple config file, with entirely optional defaults and presets
3. Provide an easy pathway for coding assistants to create sophisticated rules
