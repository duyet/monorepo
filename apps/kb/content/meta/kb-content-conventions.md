---
title: "KB Content Conventions"
category: "meta"
tags: ["kb", "meta", "frontmatter", "conventions"]
links: ["about-this-kb", "duyetbot-scope"]
summary: "Frontmatter schema, category slugs, tag rules, and article length guidelines for apps/kb/content articles."
updated: "2026-05-26"
---

# KB Content Conventions

These rules govern how articles in `apps/kb/content/` are written and structured.

## Frontmatter schema

```yaml
---
title: "string"
category: "category-slug"
tags: ["tag1", "tag2"]
links: ["other-article-slug", ...]
summary: "one-sentence summary for index + llms.txt"
updated: "YYYY-MM-DD"
---
```

All fields are required.

## Categories (exact slugs)

| Slug | Covers |
|------|--------|
| `infrastructure` | Cloudflare, deploy, WASM build, CI |
| `design-system` | design tokens, dark mode, shadcn migration |
| `apps` | per-app overviews |
| `agents` | duyetbot scope, agent refactor, autonomous workflows |
| `data-pipeline` | data sync, ClickHouse, CCUsage |
| `workflows` | commit/push/deploy, commitlint, test cache |
| `decisions` | architectural decisions |
| `meta` | about the KB, how to contribute |

## Tags

- Lowercase single words or hyphenated: `dark-mode`, `wasm`, `cloudflare`
- 2–5 tags per article
- Match to the concrete tools, patterns, or app names involved

## `links`

- List slugs of related articles (filename without `.md`)
- Each article should link to 2–5 others
- Bidirectional links are not required on both ends — the pipeline computes incoming links from outgoing

## `summary`

- Single sentence, ≤140 characters
- Goes into `/llms.txt` — make it scannable and specific
- Bad: "An article about the blog."
- Good: "apps/blog uses WASM markdown rendering and isomorphic readPublicJson for 393 SSG pages."

## Article length

50–200 lines. Lead with `# Title`, then a 2–3 sentence intro, then sections. Cite concrete file paths and commit SHAs when useful.

## Slugs

Lowercase kebab-case. Filename = slug. Example: `infrastructure/cloudflare-rocket-loader.md`.

## Tone

Terse and technical. No marketing language. No "comprehensive", "elaborate", "extensive". Write like internal documentation.
