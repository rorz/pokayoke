---
title: Docs authoring
description: Markdown conventions for the docs app.
---

# Docs Authoring

Docs content lives under `apps/docs/content/**/*.md`. Keep prose pages there so
the docs app stays the project source of truth.

## Callouts

Use GitHub-style blockquote callouts for ordinary notes:

```md
> [!NOTE]
> Keep the note short enough to scan.
```

Supported callout types are `NOTE`, `TIP`, `IMPORTANT`, `WARNING`, and
`CAUTION`.

The Markdoc `{% callout %}` tag remains available when a page needs a custom
title.

## Tailwind CSS

Keep `apps/docs/styles/tailwind.css` as the docs app Tailwind entrypoint. It may
contain Tailwind directives such as `@import`, `@source`, `@theme`, and
`@utility`, but component styling belongs in Tailwind utility classes beside the
JSX that renders it.

The `docs/tailwind-entrypoint-only` local rule rejects ordinary selector blocks
in that CSS file.
