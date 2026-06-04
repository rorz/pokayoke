# Why pokayoke

Teams already have good tools for many code quality problems.

ESLint is good at file-local syntax, style, and code quality. Knip is good at
project reachability: unused files, dependencies, exports, and binaries.
pokayoke is for repo policy that sits between those tools.

Good pokayoke rules usually look like this:

- "This generated file must match that source of truth."
- "This package must use the workspace protocol for internal dependencies."
- "This agent instruction file must not mention commands that no longer exist."
- "This environment file must require values instead of making them optional."
- "This architectural boundary must not point backwards."

These are not always elegant ESLint rules. Some need the whole repo. Some need
package metadata. Some need generated artifacts. Some need another tool.

pokayoke's job is to turn those conventions into checks that are easy to run,
hard to misunderstand, and explicit when suppressed.

## Design Goals

- Support humans and agents with the same policy layer.
- Keep project-wide rules first-class.
- Make findings explain the convention, not just the violation.
- Keep config readable and reviewable.
- Prefer warnings for guidance and errors for real forcing functions.
- Treat adapters as normal rules when another tool already owns the analysis.

## Non-Goals

- Replacing ESLint.
- Replacing Knip.
- Hiding arbitrary shell scripts behind a fancy name.
- Baking one project's private conventions into the core package.
