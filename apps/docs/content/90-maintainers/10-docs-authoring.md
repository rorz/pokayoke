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
