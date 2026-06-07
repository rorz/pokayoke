---
name: pokayoke
description: Use when adding pokayoke to a repository, authoring repo-local TypeScript policy rules, checking generated docs or agent instructions for drift, configuring suppressions or baselines, or preparing the pokayoke package itself.
---

# pokayoke

pokayoke turns repo conventions into checks that humans and agents can run.
Use it for policy that normal linters do not understand: generated artifact
drift, agent instruction drift, workspace contracts, package policy, and
project-specific TypeScript conventions.

## Setup Workflow

1. Prefer Bun commands in Bun repos.
2. Install the package with the repo's package manager.
3. Run `pokayoke init`.
4. Add `pokayoke check` to the existing verification script.
5. Keep repo-specific rules in `.pokayoke/rules`.
6. Run the repo's full check before handing work back.

For Bun:

```sh
bun add -d pokayoke
bun run pokayoke init
bun run pokayoke check
```

Do not replace existing typecheck, test, format, or dependency checks. Append
pokayoke to the gate.

## Local Rule Shape

Use `pokayoke.jsonc` as the human-facing policy surface:

```jsonc
{
  "extends": ["pokayoke/recommended"],
  "localRules": [".pokayoke/rules/**/*.rule.ts"],
  "files": ["AGENTS.md", "SKILL.md", "apps/docs/content/**/*.md", "packages/**/*.ts"],
  "rules": {
    "repo/no-root-source-files": "error"
  }
}
```

Keep repo-specific rule code in `.pokayoke/rules`. Treat `.pokayoke` as
agent-maintained but human-reviewable: agents can scaffold and revise it, and
humans should still review it like any other policy code.

```ts
import type { Rule } from "pokayoke";

export const noRootSourceFiles: Rule = {
  meta: {
    id: "repo/no-root-source-files",
    docs: "Keep source files inside packages instead of a root src folder.",
    kind: "project",
  },
  async run(context) {
    const findings = [];

    for (const file of await context.files()) {
      if (file.startsWith("src/")) {
        findings.push({
          ruleId: "repo/no-root-source-files",
          severity: "error" as const,
          message: "Root source files are not allowed.",
          file,
          advice: "Move source into a package.",
        });
      }
    }

    return { findings };
  },
};
```

## Rule Categories

- `file`: source-pattern or AST checks.
- `project`: whole-repo checks, generated artifacts, workspace policy, docs.
- `adapter`: wrappers around tools such as Biome or Knip.

Use built-in helpers from `pokayoke` for common rule work:

- `context.parseTypescript(file)` for cached TypeScript AST parsing.
- `context.glob(patterns)` for repo-relative file discovery outside `files`.
- `checkGeneratedText()` and `syncGeneratedText()` for generated artifacts.
- `locate()`, `lineAt()`, and `previousLine()` for source locations.
- `findingKey()` for baseline entries.

## Drift Rules

Agent-facing files are contracts. If an agent reads stale commands, stale
examples, or a stale generated catalogue, it can fail confidently.

Good drift rules compare one source of truth with one prose or generated
surface:

- live CLI contract to commands mentioned in `SKILL.md`
- API contract to docs tables
- route files to generated route catalogues
- `AGENTS.md` to mirrored instruction files
- package policy to install/script examples

When a generated file can be repaired mechanically, support `context.fix`:

```ts
if (context.fix) {
  await syncGeneratedText(context.root, "apps/docs/content/catalogue.md", expected);
  return { findings: [] };
}

return {
  findings: checkGeneratedText({
    actual,
    expected,
    file: "apps/docs/content/catalogue.md",
    ruleId: "agents/catalogue-in-sync",
    syncCommand: "pokayoke check --fix",
  }),
};
```

## Suppressions

Suppressions must be local and justified:

```ts
// pokayoke-ignore: typescript/no-forward-reference -- mutual recursion is intentional
```

Use file-level suppressions only near the top of a file:

```ts
// pokayoke-ignore-file: structure/max-file-lines -- generated compatibility shim
```

Do not hide broad policy debt in rule source. Use `baseline` in config when
existing violations need to be grandfathered.

## Testing Rules

Every local rule should have a small test. Use direct `bun:test` cases for
simple project rules, or `pokayoke/fixture-testing` when good/bad fixture files
make the convention clearer.

```ts
import { testRuleFixtures } from "pokayoke/fixture-testing";

import { noForbiddenCommand } from "./no-forbidden-command";

testRuleFixtures({
  rule: noForbiddenCommand,
  root: import.meta.dir,
  good: `${import.meta.dir}/fixtures/good`,
  bad: `${import.meta.dir}/fixtures/bad`,
});
```

## Publishing

Use the repository publishing workflow instead of ad hoc npm commands. Read
`apps/docs/content/publishing.md`, run `bun run pack:dry-run`, and publish through
`.github/workflows/publish.yml`.

## Documentation Source

For this repository, the docs site is the canonical source of truth. Keep
long-form project documentation in `apps/docs/content/*.md`, exposed as
root-level docs routes. Keep README as a short doorway, and update docs content
in the same change as architecture, tooling, policy, publishing, or workflow
changes.

## Handoff

Before finishing pokayoke work:

- run `bun run check` when available
- run `bun run pokayoke check` or the repo's equivalent
- verify `pokayoke.jsonc` loads
- verify local rules have tests
- verify agent-facing docs have a declared source of truth
- report any rule that is intentionally planned but not implemented
