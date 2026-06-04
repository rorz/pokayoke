# Rule Authoring

pokayoke rules do not all have the same execution model. The rule kind should
match the shape of the policy.

## Rule Kinds

- `file`: reads one file at a time.
- `project`: reads the repo, workspace graph, package metadata, or generated
  artifacts.
- `adapter`: shells out to another tool and normalizes the result.

## API

```ts
import { defineRule } from "pokayoke";

export const noExample = defineRule({
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
});
```

## Context

The rule context should expose:

- `context.root`
- `context.files()`
- `context.readFile()`
- `context.parseTypescript()`
- `context.packageJson()`
- `context.workspaces()`
- `context.report()`
- `context.execAdapter()`

Parser caching should exist early. Re-parsing every TypeScript file for every
rule is acceptable for a local script and wasteful for a real tool.

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
