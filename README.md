# Pokayoke

Pokayoke is early-stage tooling for convention forcing functions in codebases.
The name is a play on [poka-yoke](https://en.wikipedia.org/wiki/Poka-yoke),
the Japanese mistake-proofing concept: design the process so errors are caught
or prevented where they happen.

The working thesis: modern codebases need rules that humans and agents can both
understand, run, and respect. Some rules should warn. Some should block. All of
them should explain the convention they are protecting.

## Status

This repo is currently a project scaffold, not a functional implementation.
The first real feature plan is still pending.

What exists today:

- A Bun + TypeScript project shape.
- A tiny CLI placeholder that prints the project doctrine.
- A smoke test around the current exported primitives.
- Project scripts for running, checking, and testing the scaffold.

## Shape

Pokayoke will likely sit in the space between linting, repo policy, and agent
workflow control.

Useful future surfaces may include:

- Rule packs for project-specific conventions.
- Human-readable checks for local development.
- Agent-readable checks for planning, patching, and handoff.
- Warning mode for soft guidance.
- Control mode for conventions that should block progress.
- CI, pre-commit, and editor integration once the core model is clear.

## Principles

- Catch mistakes where they are made.
- Prefer forcing functions over reminders when a convention really matters.
- Keep every rule explainable.
- Make the happy path cheaper than the workaround.
- Treat humans and agents as first-class users of the same policy layer.

## Commands

Install dependencies:

```sh
bun install
```

Run the placeholder CLI:

```sh
bun run start
```

Type-check the project:

```sh
bun run check
```

Run tests:

```sh
bun test
```

## Development Notes

Use Bun for package management, scripts, tests, and runtime work. Avoid adding
Node-specific runtime dependencies unless there is a strong reason and the
tradeoff is explicit.

The next useful step is to define the first real convention model:

- What a rule is.
- What inputs it can inspect.
- What result shape it returns.
- How humans and agents consume that result.
- Which integration should come first.
