---
title: Suppressions
description: Local, justified suppression directives and unused suppression reporting.
---

# Suppressions

Suppressions are for exceptions, not for making findings disappear in bulk.

Default directive:

```ts
// pokayoke-ignore: typescript/no-forward-reference -- mutual recursion is intentional
```

The required pieces are:

- The directive name.
- One or more rule IDs.
- A reason after `--` when `requireReason` is enabled.

## Scope

pokayoke supports these forms:

```ts
// Same-line suppression.
const value = later(); // pokayoke-ignore: typescript/no-forward-reference -- reads better below
```

```ts
// Previous-line suppression.
// pokayoke-ignore: patterns/no-banned-text -- fixture intentionally contains the banned phrase
const fixture = "deprecated command";
```

```ts
// File-level suppression. Only valid in the first configured number of lines.
// pokayoke-ignore-file: structure/max-file-lines -- generated compatibility shim
```

## Unused Suppressions

Unused suppressions report according to `suppressions.reportUnused`. A stale
suppression is evidence that the code changed and the exception may no longer be
needed.

```jsonc
{
  "suppressions": {
    "fileLineLimit": 10,
    "reportUnused": "warn"
  }
}
```
