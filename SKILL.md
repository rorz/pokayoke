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

1. Prefer Bun commands. pokayoke is Bun-first and ships TypeScript source.
2. Install with the repo's package manager.
3. Run `pokayoke init`.
4. Add `pokayoke check` to the existing verification script.
5. Keep repo-owned rules in `.pokayoke/rules/**/*.rule.ts`.
6. Keep the generated `.pokayoke/tsconfig.json`; it gives editors Bun-aware
   types for local rule files without adding them to the app build.
7. Add focused tests beside local rules.
8. Run the repo's full check before handing work back.

For Bun:

```sh
bun add --save-dev pokayoke
bun run pokayoke init
bun run pokayoke check
```

Do not replace existing typecheck, test, format, or dependency checks. Append
pokayoke to the gate.

Useful CLI forms: `pokayoke`, `pokayoke init --force`, `pokayoke check`,
`pokayoke check <rule-id>`, `pokayoke check --fix`,
`pokayoke check --format json`, and `pokayoke check --verbose`.

In this repository, prefer the source-backed scripts:

```sh
bun run dogfood
bun run dogfood --fix
bun run check
```

## Local Rule Shape

Use `pokayoke.jsonc` as the root policy surface. It is the only config file
pokayoke currently loads.

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

Config supports `extends`, `localRules`, `files`, `ignores`, `suppressions`,
`rules`, `baseline`, and `workspaces`. Keep repo-specific rule code in
`.pokayoke/rules`. Treat `.pokayoke` as agent-maintained but human-reviewable:
agents can scaffold and revise it, and humans should still review it like any
other policy code.

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
    const rootSourceFiles = await context.glob(["src/**/*.ts", "src/**/*.tsx"]);

    for (const file of rootSourceFiles) {
      findings.push({
        ruleId: "repo/no-root-source-files",
        severity: "error" as const,
        message: "Root source files are not allowed in this workspace.",
        file,
        advice: "Move source code into a package or app.",
      });
    }

    return { findings };
  },
};
```

## Rule Categories

- `file`: source-pattern or AST checks.
- `project`: whole-repo checks, generated artifacts, workspace policy, docs.

Use context methods for rule work:

- `context.files()` for configured files after ignores.
- `context.glob(patterns)` for repo-relative discovery outside `files`.
- `context.readFile(file)` for cached file reads.
- `context.parseTypescript(file)` for cached TypeScript AST parsing.
- `context.packageJson(workspace)` and `context.workspaces()` for package
  metadata.
- `context.report(finding)` for incremental findings.

Use imports from `pokayoke` for common helpers:

- `defineRule()`, `definePlugin()`, and `definePreset()` for reusable rule
  packages.
- `checkGeneratedText()` and `syncGeneratedText()` for generated artifacts.
- `locate()`, `lineAt()`, `previousLine()`, and `countLines()` for source
  locations and line counts.
- `findingKey()` for baseline entries.

## Bundled Presets

Current bundled presets:

- `pokayoke/recommended`: `structure/max-file-lines`,
  `suppressions/no-unused`.
- `pokayoke/typescript/recommended`: `typescript/no-forward-reference`,
  `typescript/no-optional-env`, `typescript/no-swallowed-errors`.
- `pokayoke/package-policy/bun-workspaces`: `package/catalog`,
  `package/workspace-protocol`, `package/no-npx-in-scripts`.
- `pokayoke/patterns/recommended`: empty today, with pattern rules available
  for explicit opt-in.

Other bundled rules include `typescript/enforce-arrow-function`,
`patterns/file-must-match`, `patterns/no-banned-text`, and
`patterns/required-text`.

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
  findings: checkGeneratedText({ actual, expected, file, ruleId, syncCommand }),
};
```

## Suppressions

Suppressions must be local and justified. They can apply to the same line,
previous line, or a whole file near the top of the file:

```ts
const value = later(); // pokayoke-ignore: typescript/no-forward-reference -- reads better below
// pokayoke-ignore: patterns/no-banned-text -- fixture intentionally contains this phrase
const fixture = "deprecated command";
// pokayoke-ignore-file: structure/max-file-lines -- generated compatibility shim
```

Do not hide broad policy debt in rule source. Use `baseline` in config when
existing violations need to be grandfathered.

## Testing Rules

Every local rule should have a small test. Use direct `bun:test` for simple
project rules, or `pokayoke/fixture-testing` when good/bad fixture files make
the convention clearer.

```ts
import { testRuleFixtures } from "pokayoke/fixture-testing";
import { noForbiddenCommand } from "./no-forbidden-command";
testRuleFixtures({ rule: noForbiddenCommand, root: import.meta.dir, good, bad });
```

## Publishing

Use the repository publishing workflow instead of ad hoc npm commands. Read
`apps/docs/content/90-maintainers/00-publishing.md`, run
`bun run publish:check`, and publish through `.github/workflows/publish.yml`.

## Documentation Source

For this repository, [pokayoke.codes](https://pokayoke.codes) is the canonical
docs site. Keep long-form docs in `apps/docs/content/**/*.md`, exposed through
routes such as `/configuration`, `/rule-design`, `/suppressions`,
`/included-rules`, and `/maintenance/publishing`. Keep README as a short
doorway, and update docs content with architecture, tooling, policy,
publishing, or workflow changes.

## Handoff

Before finishing pokayoke work:

- run `bun run check` when available
- run `bun run dogfood` or the repo's equivalent
- verify `pokayoke.jsonc` loads
- verify local rules have tests
- verify agent-facing docs have a declared source of truth
- verify generated docs or public assets are fixed with `bun run dogfood --fix`
  when a deterministic sync rule reports drift
- report any rule that is intentionally planned but not implemented
