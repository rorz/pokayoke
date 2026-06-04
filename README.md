# 🧩 pokayoke

pokayoke is repo-policy tooling for convention checks that are awkward in ESLint
and outside Knip's scope.

The name is a play on [poka-yoke](https://en.wikipedia.org/wiki/Poka-yoke), the
Japanese mistake-proofing concept. The software version is the same idea applied
to codebases: convert fragile prose conventions into mechanical rails that
humans and agents can both run, understand, and respect.

## Positioning

ESLint is strongest at file-local syntax and code quality. Knip is strongest at
project reachability: unused files, dependencies, exports, and binaries.
pokayoke owns the middle layer:

- Architectural invariants.
- Generated artifact drift.
- Repo conventions.
- Workspace and package policy.
- Docs-to-code consistency.
- Checks for regressions that should never quietly return.

This should not become "ESLint with more rules." The core product is the
project-wide policy model.

## Project Shape

```txt
packages/
  pokayoke/        # CLI, engine types, bundled rules, core presets
SKILL.md           # agent-facing setup and rule-authoring instructions
docs/
  why-pokayoke.md
  configuration.md
  suppressions.md
  rule-authoring.md
  agent-setup.md
  agent-rules.md
  adapters.md
  publishing.md
examples/
  basic/
    .pokayoke/
      config.ts
```

Current packages:

- `pokayoke`

Bundled rule families:

- `pokayoke/typescript/recommended`
- `pokayoke/package-policy/bun-workspaces`
- `pokayoke/patterns/recommended`

## Rule Model

Rules have one of three kinds:

- `file`: checks that operate on one file at a time.
- `project`: checks that need the whole repo or workspace graph.
- `adapter`: checks that delegate to another tool and normalize the result.

That distinction is the main design call. Forcing project-wide policy through a
file visitor gets ugly quickly.

## Configuration

The easiest local policy surface is `.pokayoke/config.ts`. Root config files
still work as explicit overrides, but the folder convention keeps local rules
and config together.

Lookup order:

1. `pokayoke.config.ts`
2. `pokayoke.config.js`
3. `pokayoke.jsonc`
4. `.pokayoke/config.ts`
5. `.pokayoke/pokayoke.ts`
6. `.pokayoke/pokayoke.jsonc`
7. `.pokayoke.jsonc`
8. `package.json#pokayoke`

See [docs/configuration.md](docs/configuration.md).

## Agent Rules

Agent-facing instructions are repo contracts too. pokayoke should help keep
agent docs, examples, generated catalogues, and mirrored instruction files in
sync with the live code and CLI surface.

Start with [SKILL.md](SKILL.md) when an agent needs to install pokayoke, create
rules, test rules, or keep agent-facing docs current.

See [docs/agent-setup.md](docs/agent-setup.md) for the setup checklist.
See [docs/agent-rules.md](docs/agent-rules.md).

## Suppressions

Suppressions should be explicit, local, and justified by default.

```ts
// pokayoke-ignore: typescript/no-forward-reference -- mutual recursion is intentional
```

See [docs/suppressions.md](docs/suppressions.md).

## MVP Order

1. CLI, config loader, JSONC parser, and schema validation.
2. File collection with files, ignores, workspaces, and overrides.
3. Terminal and JSON reporters.
4. Suppression parser with required reasons and unused-suppression reporting.
5. Generic TypeScript, package policy, and pattern rules.
6. Adapter rules for existing tools.
7. Fix-capable generated artifact helpers.

## Commands

Install dependencies:

```sh
bun install
```

Run the CLI:

```sh
bun run start
```

Create a starter `.pokayoke` policy folder:

```sh
bun run start init
```

Run pokayoke against this repo:

```sh
bun run dogfood
```

Run the full gate:

```sh
bun run check
```

Run individual strict checks:

```sh
bun run typecheck
bun run biome
bun run knip
```

Run tests:

```sh
bun test
```

Inspect npm package contents:

```sh
bun run publish:check
```

Publish through the GitHub Actions trusted publishing workflow. First configure
the trusted publisher on npmjs.com, then publish a GitHub release. See
[docs/publishing.md](docs/publishing.md).

## Development Notes

Use Bun for package management, scripts, tests, and runtime work. Avoid adding
Node-specific runtime dependencies unless there is a strong reason and the
tradeoff is explicit.

Packages intentionally publish TypeScript source for Bun rather than bundled
JavaScript. Keep `exports`, `bin`, `files`, and peer dependency ranges valid for
npm before publishing.
