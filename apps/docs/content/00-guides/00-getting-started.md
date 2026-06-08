---
title: Getting started
description: Set pokayoke up in minutes
---

Integrating pokayoke into your project is as easy as running a few commands in your terminal, or getting your agent to do all of that for you.

{% callout title="Bun is required" tone="warning" %}
Currently, pokayoke is in alpha and only works for projects that use -- or have access to -- the `bun` runtime.
{% /callout %}



## Agent-first

```sh
# Anywhere in your terminal
bunx skills add rorz/pokayoke
```


## Human-first

### Install the dependency and initialize

```sh
# In your repo's root directory
bun add --save-dev pokayoke
bun run pokayoke init
bun run pokayoke check
```

### Integrate into `package.json` scripts
```json
{
  ... // Your package.json file
  "scripts": {
    "format": "<existing format command>",
    "lint": "<existing lint command>",
    "check": "bun lint && bun format && bun pokayoke" // Add here
  }
  ...
}
```
### Code assistant support

If you work with agents it is **highly recommended** to reference the pokayoke documentation in your `AGENTS.md` file or `*/rules/*` folder. You can do this easily by referencing the following (in whichever file format you use):

```md
This repository uses [pokayoke](https://www.npmjs.com/package/pokayoke) to create and manage rules for deterministic code checking. Go to the `node_modules` for the pokayoke reference on configuration, and understanding and creating rules.
```
