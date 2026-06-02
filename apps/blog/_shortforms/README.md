# Quick Notes

Short-form thoughts. Each file in this folder becomes one card on
`/notes` and (the latest 3) on the blog index.

Filename: `YYYY-MM-DD-slug.md`. Frontmatter only needs `date:`.

```
---
date: 2026-05-26
title: xxx
slug: yyy
---

Your note body here. Markdown or plain text renders.
```

The `import.meta.glob` loader matches `*.md` files at the top level of
this folder. This README is not picked up because the loader excludes
it (`README.md` doesn't match the date prefix and Vite's glob target is
explicit). If empty, the index shows an empty state instead of hiding.
