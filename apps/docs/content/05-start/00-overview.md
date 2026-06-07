---
title: Overview
description: The short version of what pokayoke is for and how to start.
---

# pokayoke

Repo policy tooling for checks that sit between file-local linting and whole
project reachability.

{% callout title="Design center" tone="note" %}
pokayoke turns conventions into checks that humans and agents can both run. The
good rules are boring in the best way: direct, reviewable, and hard to
misread.
{% /callout %}

## Fast path

```sh
bun add -d pokayoke
bun run pokayoke init
bun run pokayoke check
```

## What it owns

- Architectural invariants.
- Generated artifact drift.
- Workspace and package policy.
- Agent-facing instruction drift.
- Checks that need project context.

## Mental model

Use pokayoke for conventions that are too broad for ESLint and too intentional
for Knip. A good rule points to one contract, reports one kind of drift, and
names the repair path plainly.

{% callout title="Repo shape" tone="success" %}
This docs service owns the long-form project documentation. User-facing usage
guidance lives in the main nav; repo maintenance notes live under the
maintainer section.
{% /callout %}
