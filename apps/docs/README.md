# pokayoke docs

Vinext docs service for `pokayoke.codes`.

## Commands

```sh
bun run docs:dev
bun run docs:build
bun run docs:deploy
```

The service uses Markdoc, Tailwind CSS, Zalando Sans, and Phosphor icons. It
renders canonical project documentation from `apps/docs/content/*.md`.

Deployment targets Cloudflare Workers through `vinext deploy`. Set
`CLOUDFLARE_ACCOUNT_ID` or add an `account_id` to `apps/docs/wrangler.jsonc`
before deploying from a fresh machine.
