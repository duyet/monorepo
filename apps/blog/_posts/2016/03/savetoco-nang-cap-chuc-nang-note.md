---
title: saveto.co — adding markdown notes and code snippets
date: '2016-03-24'
author: Duyet
tags:
  - Side Project
modified_time: '2025-05-15T00:00:00.000+07:00'
thumbnail: https://4.bp.blogspot.com/-IQqx5voNl_w/VvLTmSA8WLI/AAAAAAAASMk/gcSzeVC8jd8m8mZIn5ySX_ytb_F1YLSFA/s1600/screencapture-saveto-co-note-1458754419141.png
slug: /2016/03/savetoco-nang-cap-chuc-nang-note
category: Project
description: A 2016 changelog for saveto.co — adding a markdown note and code-snippet feature on top of the URL shortener.
---

> **Archive note (2025):** The hosted `saveto.co` service is no longer running. Source code remains at [github.com/saveto-co](https://github.com/saveto-co). This post is kept as a project changelog.

[saveto.co](https://saveto.co/) was a side-project URL shortener and link-sharing service I ran in 2016 — "home for the best link in the internet" was the tagline. This release added a small but useful extension: **notes and code snippets**, not just links.

## What changed

Two new things landed in this release:

- **Markdown notes.** Anything saved as plain text was rendered as Markdown by default — no extra flag, no `.md` suffix needed (though `.md` was accepted).
- **Syntax-highlighted snippets.** To get highlighting on a code paste, you named the snippet with a real extension — for example `main.js` for JavaScript. The renderer used the extension to pick a language.

[![saveto.co note editor screenshot](https://4.bp.blogspot.com/-IQqx5voNl_w/VvLTmSA8WLI/AAAAAAAASMk/gcSzeVC8jd8m8mZIn5ySX_ytb_F1YLSFA/s1600/screencapture-saveto-co-note-1458754419141.png)](https://4.bp.blogspot.com/-IQqx5voNl_w/VvLTmSA8WLI/AAAAAAAASMk/gcSzeVC8jd8m8mZIn5ySX_ytb_F1YLSFA/s1600/screencapture-saveto-co-note-1458754419141.png)

## Who could use it

Notes were open to everyone, including anonymous visitors. Logged-in users got the extras:

- A list of all their notes at `saveto.co/note/all`
- The ability to edit and delete their own notes
- View counts per note

Anonymous notes were write-once: no edit, no delete.

## Original links

For reference (now offline):

- `https://saveto.co/note`
- `https://ahihi.club/note`
- Source code: [github.com/saveto-co](https://github.com/saveto-co)
