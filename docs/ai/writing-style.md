# Duyet's Writing Style

A guide for drafting blog posts and notes in Duyet's voice. Derived from `apps/blog/_posts/**` (313 posts) and `apps/blog/_shortforms/**`. Use this when asked to write or edit content for the blog.

## Voice in one line

First-person, pragmatic engineer writing from real experience. Grounded and hype-aware, never breathless. Shows the actual commands, screenshots, and numbers, then steps back with a short honest takeaway.

## Two post modes

**Narrative / experience posts** (recent, mostly `category: AI`, `series: AI Harness Engineering`). A short story about something the author actually did — handing Claude Code an overnight task, wiring a voice notifier. Structure is loose: a hook, a chronological walk-through with screenshots, and a closing reflection. Example openings:

> A quick snapshot of where coding agents are in 2026: you can hand one a real, multi-part task, walk away, and come back to merged PRs, a live deploy, and a few issues it worked around on its own.

**Technical guides** (Data/ClickHouse/Rust/Web). Numbered, scannable sections. Opens with the problem and a bulleted "in this guide you'll learn" list, then `# 1.`, `# 2.` sections, generous reference links, and code blocks with real commands. These run longer than the narrative posts.

## Conventions

- **Length**: recent posts average ~580 words; technical guides go longer. Favor tight over padded.
- **Opening line**: a one-sentence tl;dr that usually mirrors the `description` frontmatter. No throat-clearing.
- **Headings**: older guides use `#`/`##` with numbered sections (`# 1. Built-in dashboard`); newer narrative posts use plain `##`. Match the mode.
- **Code**: lots of inline `code` and fenced blocks with the actual commands/config, not pseudocode. Show real flags, paths, and output.
- **Screenshots**: stored under `/media/<YYYY>/<MM>/<slug>/...`; multiple images grouped in `<div class="img-row">...<img/></div>`. Alt text describes what's shown.
- **Links**: link generously — to references (ClickHouse blog, docs, YouTube), to the author's own past posts, and to tools/repos.
- **Tone markers**: casual asides, occasional emoji (🗿), the odd punchy closer ("Coolest thing ever."), light self-deprecation ("I never looked at the code"). Confident but not salesy.
- **Endings**: narrative posts end on a reflection that reframes the takeaway ("The interesting question is no longer 'can it write the code' but how it manages itself…"). Guides end with references or a short "Kết" — not a generic "Conclusion."
- **Bilingual**: English by default. The `Rust Tiếng Việt` series is fully Vietnamese (tags `Vietnamese`, `Rust Tiếng Việt`). Keep the language consistent within a post.

## Frontmatter template

```yaml
---
title: <Title Case, concrete, not clickbait>
date: <YYYY-MM-DD>
author: Duyet
category: <AI | Data | Rust | Web | Javascript | Machine Learning | ...>
series: <optional, e.g. AI Harness Engineering>
tags:
  - <Tag>
  - <Tag>
slug: /<YYYY>/<MM>/<slug>
thumbnail: /media/<YYYY>/<MM>/<slug>/<image>
description: "<1–2 sentence summary; doubles as the opening line>"
---
```

Older posts may also carry `featured: true` and `twitterCommentUrl`. Shortforms use a minimal frontmatter: `date`, `title`, `slug` only.

## Shortforms

`apps/blog/_shortforms/<Title>.md` — one idea, dated, a few sentences. Often a quote block, a small install/command snippet, and a one-line reaction. Think "tweet with room to breathe," not a full post.

## Do / Don't

- Do write from first-hand experience and show the receipts (commands, screenshots, session cost/time numbers).
- Do keep paragraphs short and skimmable.
- Don't oversell or use marketing language; let the result speak.
- Don't invent results or screenshots — if there's no evidence, say so plainly.
- Don't bury the point; lead with it.
