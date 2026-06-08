<p align="center">
  <a href="https://pokayoke.codes">
    <img alt="pokayoke" src="https://raw.githubusercontent.com/rorz/pokayoke/main/apps/docs/public/logo.svg" width="520" />
  </a>
</p>

# pokayoke

[![npm](https://img.shields.io/npm/v/pokayoke?style=flat-square)](https://www.npmjs.com/package/pokayoke)
[![npm downloads](https://img.shields.io/npm/dm/pokayoke?style=flat-square)](https://www.npmjs.com/package/pokayoke)
[![GitHub](https://img.shields.io/github/stars/rorz/pokayoke?style=flat-square)](https://github.com/rorz/pokayoke)
[![license](https://img.shields.io/npm/l/pokayoke?style=flat-square)](https://github.com/rorz/pokayoke/blob/main/LICENSE)

> **Docs:** [pokayoke.codes](https://pokayoke.codes) is the canonical guide for
> setup, configuration, rule design, suppressions, and publishing.

pokayoke is repo-policy tooling for checks that sit between normal linting and
project reachability.

It turns conventions that usually live in prose into deterministic checks:
agent instructions that drift, generated docs that go stale, workspace package
policy, architecture boundaries, and TypeScript rules too specific for a
general-purpose linter.

Use it alongside the tools you already trust. Biome formats. TypeScript
typechecks. Knip finds dead project surface. pokayoke owns the conventions that
belong to your repo.

The name comes from poka-yoke, the mistake-proofing idea: design the system so
recurrent pitfalls are harder to miss and easier to repair.

## What It Checks

- Repo-local TypeScript rules with whole-project context.
- Generated artifacts against their source of truth, with fix mode when the
  repair is deterministic.
- Agent-facing docs and instructions that must stay aligned with real commands,
  config, and project contracts.
- Package and workspace policy such as `workspace:*`, catalog usage, and no
  `npx` in Bun scripts.

## Quick Start

pokayoke currently targets Bun projects.

```sh
bun add --save-dev pokayoke
bun run pokayoke init
bun run pokayoke check
```

Add it to the existing verification gate rather than replacing type checks,
tests, formatting, or dependency checks.

```json
{
  "scripts": {
    "check": "bun run typecheck && bun run test && bun run pokayoke"
  }
}
```

For agent setup:

```sh
bunx skills add rorz/pokayoke
```

## Documentation

The docs site is the canonical source of truth for this project.

- Production docs: [pokayoke.codes](https://pokayoke.codes)
- Local docs: run `bun run docs:dev`, then open `http://localhost:7870`
- Canonical source files: `apps/docs/content/**/*.md`

Keep this README as the front door. Architecture, tooling, rule authoring,
agent setup, suppressions, publishing, and policy details belong in the docs
app.

## Project Shape

```txt
apps/
  docs/             # Vinext + Markdoc docs site and canonical docs content
packages/
  pokayoke/         # CLI, engine types, bundled rules, presets
.pokayoke/
  rules/            # repo-local policy rules for dogfooding pokayoke
pokayoke.jsonc      # root policy config
SKILL.md            # agent-facing pokayoke workflow
```

Current package:

- `pokayoke`

Current docs service:

- `@pokayoke/docs`

## Working On This Repo

Install dependencies:

```sh
bun install
```

Run the CLI:

```sh
bun run start
```

Run pokayoke against this repo:

```sh
bun run dogfood
```

Run the full gate:

```sh
bun run check
```

Run the docs site locally:

```sh
bun run docs:dev
```

Build the docs site:

```sh
bun run docs:build
```
