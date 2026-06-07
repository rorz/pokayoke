# pokayoke

[![npm](https://img.shields.io/npm/v/pokayoke?style=flat-square)](https://www.npmjs.com/package/pokayoke)
[![npm downloads](https://img.shields.io/npm/dm/pokayoke?style=flat-square)](https://www.npmjs.com/package/pokayoke)
[![GitHub](https://img.shields.io/github/stars/rorz/pokayoke?style=flat-square)](https://github.com/rorz/pokayoke)
[![publish](https://img.shields.io/github/actions/workflow/status/rorz/pokayoke/publish.yml?style=flat-square&label=publish)](https://github.com/rorz/pokayoke/actions/workflows/publish.yml)
[![license](https://img.shields.io/npm/l/pokayoke?style=flat-square)](https://github.com/rorz/pokayoke/blob/main/LICENSE)

pokayoke is repo-policy tooling for convention checks that are awkward in
ESLint and outside Knip's scope.

The name comes from poka-yoke, the mistake-proofing idea: turn fragile prose
conventions into rails that humans and agents can run, understand, and respect.

## Documentation

The docs site is the canonical source of truth for this project.

- Production docs: [pokayoke.codes](https://pokayoke.codes)
- Local docs: run `bun run docs:dev`, then open `http://localhost:7870`
- Canonical source files: `apps/docs/content/*.md`

Keep this README short. Architecture, tooling, publishing, rule authoring,
agent setup, suppressions, adapters, and policy details belong in the docs app.
When the project changes, update the docs app in the same change.

## Project Shape

```txt
apps/
  docs/             # Vinext + Markdoc docs site and canonical docs content
packages/
  pokayoke/         # CLI, engine types, bundled rules, core presets
.pokayoke/
  rules/            # repo-local policy rules
pokayoke.jsonc      # root policy config
SKILL.md            # agent-facing pokayoke workflow
```

Current package:

- `pokayoke`

Current docs service:

- `@pokayoke/docs`

## Commands

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

Inspect npm package contents:

```sh
bun run publish:check
```

## Development Notes

Use Bun for package management, scripts, tests, and runtime work.

Packages intentionally publish TypeScript source for Bun rather than bundled
JavaScript. Keep `exports`, `bin`, `files`, and peer dependency ranges valid for
npm before publishing.
