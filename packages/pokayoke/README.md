# pokayoke

[![npm](https://img.shields.io/npm/v/pokayoke?style=flat-square)](https://www.npmjs.com/package/pokayoke)
[![npm downloads](https://img.shields.io/npm/dm/pokayoke?style=flat-square)](https://www.npmjs.com/package/pokayoke)
[![GitHub](https://img.shields.io/github/stars/rorz/pokayoke?style=flat-square)](https://github.com/rorz/pokayoke)
[![license](https://img.shields.io/npm/l/pokayoke?style=flat-square)](https://github.com/rorz/pokayoke/blob/main/LICENSE)

> **Docs:** [pokayoke.codes](https://pokayoke.codes) is the canonical guide for
> setup, configuration, rule design, suppressions, and publishing.

repo-policy tooling for convention checks that humans and agents can both run.

```sh
bun add -d pokayoke
bun run pokayoke init
bun run pokayoke check
```

pokayoke is intentionally shipped as TypeScript source for Bun. It does not
bundle repo-specific rules; repo-local policy lives in `pokayoke.jsonc` and
agent-maintained rule code lives in `.pokayoke/rules`.
