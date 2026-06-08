---
title: Rule design
description: Rule kinds, implementation shape, findings, helpers, tests, and fix mode.
---

# Rule Design

pokayoke rules encode repo contracts. A good rule is small enough to review,
specific enough to explain itself, and deterministic enough to run in every
check.

Before writing code, answer five questions:

- What exact convention does this rule protect?
- What source of truth proves the convention?
- Which files or repo metadata does it need?
- What should a human or agent do when it fails?
- Should the finding be a warning or a hard error?

## Rule Kinds

- `file`: checks one configured file at a time.
- `project`: checks the repo, workspace graph, package metadata, docs, or
  generated artifacts.

Use `file` rules for source-pattern and AST checks. Use `project` rules when
the policy depends on several files or the repository shape.

## Local Rule Files

Local rules live in `.pokayoke/rules` and are loaded by the `localRules` globs
in `pokayoke.jsonc`; bundled rule IDs live in [Rules](/rules).

```jsonc
{
  "localRules": [".pokayoke/rules/**/*.rule.ts"],
  "rules": {
    "repo/no-root-source-files": "error"
  }
}
```

Use the `.rule.ts` suffix for files that should be imported during checks.
Keep tests beside rules so policy changes are easy to review.

## Project Rule Example

This rule rejects root-level source files in a monorepo.

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
    const rootSourceFiles = await context.glob([
      "src/**/*.ts",
      "src/**/*.tsx",
      "src/**/*.js",
      "src/**/*.jsx",
    ]);

    for (const file of rootSourceFiles) {
      findings.push({
        ruleId: "repo/no-root-source-files",
        severity: "error" as const,
        message: "Root source files are not allowed in this workspace.",
        file,
        advice: "Move source code into an app or package.",
      });
    }

    return { findings };
  },
};
```

This is a `project` rule because it asks a repo-level question: does any source
file exist in a forbidden location?

## File Rule Example

This rule catches placeholder copy in configured files.

```ts
import type { Rule } from "pokayoke";
import { locate } from "pokayoke";

export const noTodoCopy: Rule = {
  meta: {
    id: "content/no-todo-copy",
    docs: "Reject placeholder TODO copy in committed prose.",
    kind: "file",
  },

  async run(context) {
    const findings = [];

    for (const file of await context.files()) {
      const source = await context.readFile(file);
      const index = source.indexOf("TODO");

      if (index < 0) {
        continue;
      }

      const location = locate(source, index);

      findings.push({
        ruleId: "content/no-todo-copy",
        severity: "warn" as const,
        message: "Committed copy still contains TODO.",
        file,
        line: location.line,
        column: location.column,
        excerpt: "TODO",
        advice: "Replace the placeholder with final copy or remove the section.",
      });
    }

    return { findings };
  },
};
```

Use this shape when the configured `files` list is already the correct check
surface.

## AST Checks

Use `context.parseTypescript(file)` when string matching would be brittle.
The parser result is cached per file during a check run.

```ts
const sourceFile = await context.parseTypescript(file);
```

Use AST checks for TypeScript-specific policy such as function declaration
style, optional environment values, swallowed errors, forbidden imports, or
architectural boundaries.

## Generated Drift

Generated files should have one source of truth. A rule can support check and
fix mode:

```ts
import { checkGeneratedText, syncGeneratedText } from "pokayoke";

if (context.fix) {
  await syncGeneratedText(context.root, "apps/docs/content/routes.md", expected);
  return { findings: [] };
}

return {
  findings: checkGeneratedText({
    actual,
    expected,
    file: "apps/docs/content/routes.md",
    ruleId: "docs/routes-in-sync",
    syncCommand: "pokayoke check --fix",
  }),
};
```

Only write in fix mode when the repair is deterministic. If a human needs to
choose the wording or architecture, report a finding instead.

## Findings

Findings should explain the convention and the repair path. Include `file`,
`line`, `column`, `excerpt`, and `advice` whenever they help a human or agent
act without guessing. Good findings name the contract. Weak findings only say
something is wrong.

## Context Helpers

Useful context methods:

- `context.files()`: configured files after ignores.
- `context.glob(patterns)`: repo-relative discovery outside configured files.
- `context.readFile(file)`: cached file reads.
- `context.parseTypescript(file)`: cached TypeScript parsing.
- `context.packageJson(workspace)`: package metadata.
- `context.workspaces()`: discovered workspaces.

Useful imports:

- `locate()`, `lineAt()`, and `previousLine()` for source locations.
- `checkGeneratedText()` and `syncGeneratedText()` for generated files.
- `findingKey()` for baseline entries.

## Tests

Use `pokayoke/fixture-testing` when good and bad files make the convention easy
to see:

```ts
import { testRuleFixtures } from "pokayoke/fixture-testing";

import { noRootSourceFiles } from "./no-root-source-files.rule";

testRuleFixtures({
  rule: noRootSourceFiles,
  root: import.meta.dir,
  good: `${import.meta.dir}/fixtures/good`,
  bad: `${import.meta.dir}/fixtures/bad`,
});
```

Use direct `bun:test` for package metadata, workspaces, or generated output.
