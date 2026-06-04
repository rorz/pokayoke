# pokayoke

repo-policy tooling for convention checks that humans and agents can both run.

```sh
bun add -d pokayoke
bun run pokayoke init
bun run pokayoke check
```

pokayoke is intentionally shipped as TypeScript source for Bun. It does not
bundle rules; repo-local policy lives in `.pokayoke/config.ts` and
`.pokayoke/rules`.

See the repository README and `SKILL.md` for rule-authoring guidance.
