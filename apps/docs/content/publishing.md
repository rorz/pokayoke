# Publishing

pokayoke publishes as one npm package: `pokayoke`.

The repo uses GitHub Actions trusted publishing. That means npm publishes from
the workflow through OIDC instead of a long-lived npm token.

## First-Time Setup

Configure npm trusted publishing for the package on npmjs.com:

1. Open the `pokayoke` package settings.
2. Go to `Trusted publishing`.
3. Select `GitHub Actions`.
4. Enter the settings below.

Use these values:

- package: `pokayoke`
- provider: GitHub Actions
- organization or user: `rorz`
- repository: `pokayoke`
- workflow filename: `publish.yml`
- environment name: `npm`
- allowed action: `npm publish`

The repo script runs `npm@latest` for the setup command, so your globally
installed npm version does not matter:

```sh
bun run publish:setup
```

On GitHub, create an `npm` environment and require approval if you want a manual
review step before publishing.

## Release Flow

1. Bump `packages/pokayoke/package.json`.
2. Run `bun run publish:check`.
3. Commit the version change.
4. Create and publish a GitHub release.

The package name already exists on npm, so every real publish must use a version
that is higher than the currently published version.

Publishing the GitHub release runs `.github/workflows/publish.yml`. Prereleases
publish with the `next` dist-tag; normal releases publish with `latest`.

You can also run the workflow manually from `main`. Use dry run first when you
want the full CI path without publishing.

## Package Contents

Packages publish TypeScript source for Bun rather than bundled JavaScript. Keep
package manifests publishable:

- `bin` points at a Bun shebang file.
- `exports` includes `types` and `import` targets.
- bundled rule families live inside the `pokayoke` package.
- workspace development links do not leak into the published package.

Inspect package contents before publishing:

```sh
bun run publish:check
```

## Local Emergency Publish

Trusted publishing should be the normal path. If you need to publish locally:

```sh
bun run publish:check
npm publish --workspace pokayoke
```

Local publishing requires npm login and whatever 2FA policy is configured for
the package.
