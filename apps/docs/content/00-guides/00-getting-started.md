---
title: Getting started
description: Set pokayoke up in minutes
---

Integrating pokayoke into your project is as easy as running a few commands in your terminal, or getting your agent to do all of that for you.

{% callout title="Bun is required" tone="warning" %}
Currently, pokayoke is in alpha and only works for projects that use -- or have access to -- the `bun` runtime.
{% /callout %}

## For humans

```sh
# In your repo's root directory
bun add --save-dev pokayoke
bun run pokayoke init
bun run pokayoke check
```

## For agents

```sh
# Anywhere in your terminal
bunx skills add rorz/pokayoke
```
