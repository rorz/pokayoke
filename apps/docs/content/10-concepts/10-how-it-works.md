---
title: How pokayoke works
description: A top-level primer on the mechanics behind pokayoke.
---

Pokayoke is split into the following parts:
- A `pokayoke` command-line tool to run configured rules
- A `pokayoke.jsonc` singular, top-level configuration file
- A `.pokayoke/` directory that stores rules and, if configured, their tests

## Invoking the command

When you run the `pokayoke` command, the pokayoke runner iterates over each rule that has been defined in `.pokayoke/rules` and reports back if they succeeded or failed.

## Rules

Rules are TypeScript files, and can contain anything you like: that's the point of pokayoke. Pokayoke gives your agents a thin library to declare rule files that do things such as traverse your project's AST, or evaluate string matches based on arbitrary constraints.

Pokayoke is designed to be unopinionated, and you are encouraged to ask your coding assistant to create a pokayoke rule for any process or convention that you would prefer to be deterministically evaluated. It's advisable to create companion test files for your rules so that your agent can evaluate the different cases it expects a rule to guard against upfront.

[Read more about rules here.](/rule-design)
