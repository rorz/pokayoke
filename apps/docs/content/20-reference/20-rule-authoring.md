---
title: Rule authoring
description: Rule kinds, context helpers, and implementation shape.
---

# Rule Authoring

pokayoke rules do not all have the same execution model. The rule kind should
match the shape of the policy.

## Rule Kinds

- `file`: reads one file at a time.
- `project`: reads the repo, workspace graph, package metadata, or generated
  artifacts.
- `adapter`: shells out to another tool and normalizes the result.

## API

Local rules live in `.pokayoke/rules` and are loaded from the `localRules`
globs in `pokayoke.jsonc`. Use the `.rule.ts` suffix for modules that should be
imported during checks.

```ts
import type { Rule } from "pokayoke";

export const noExample: Rule = {
  meta: {
    id: "patterns/no-example",
    docs: "Explain the convention this rule protects.",
    kind: "file",
  },

  async run(context) {
    const findings = [];

    for (const file of await context.files()) {
      const source = await context.readFile(file);

      if (source.includes("example")) {
        findings.push({
          ruleId: "patterns/no-example",
          severity: "warn",
          message: "Avoid placeholder example text in committed code.",
          file,
          advice: "Replace it with domain-specific copy.",
        });
      }
    }

    return { findings };
  },
};
```

## Context

The rule context should expose:

- `context.root`
- `context.files()`
- `context.glob()`
- `context.readFile()`
- `context.parseTypescript()`
- `context.packageJson()`
- `context.workspaces()`
- `context.report()`
- `context.execAdapter()`

Parser caching should exist early. Re-parsing every TypeScript file for every
rule is acceptable for a local script and wasteful for a real tool. The current
runner caches `context.parseTypescript(file)` per file.

## Useful Helpers

Import helpers from `pokayoke` when local rules need common source plumbing:

```ts
import {
  checkGeneratedText,
  lineAt,
  locate,
  previousLine,
  syncGeneratedText,
} from "pokayoke";
```

- `context.parseTypescript(file)`: cached TypeScript `SourceFile` parsing.
- `context.glob(patterns)`: repo-relative file discovery outside configured
  `files`.
- `locate(source, index)`: one-indexed line and column.
- `lineAt(source, index)`: full source line for an offset.
- `previousLine(source, index)`: previous source line for suppression-style checks.
- `checkGeneratedText(...)`: report generated artifact drift.
- `syncGeneratedText(...)`: write a generated file when `context.fix` is true.

## Findings

Findings should include enough context for humans and agents to act.

```ts
type Finding = {
  ruleId: string;
  severity: "warn" | "error";
  message: string;
  file?: string;
  line?: number;
  column?: number;
  excerpt?: string;
  advice?: string;
};
```

Good findings explain the convention. They do not merely point at a line and
say it is wrong.

## Generated Drift

Generated files should have one source of truth. A rule can support both check
and fix mode:

```ts
if (context.fix) {
  await syncGeneratedText(context.root, "apps/docs/content/20-reference/catalogue.md", expected);
  return { findings: [] };
}

return {
  findings: checkGeneratedText({
    actual,
    expected,
    file: "apps/docs/content/20-reference/catalogue.md",
    ruleId: "agents/catalogue-in-sync",
    syncCommand: "pokayoke check --fix",
  }),
};
```

## Tests

Use `bun:test` for direct rule tests. Use `pokayoke/fixture-testing` when a rule
is clearer as good and bad files:

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
