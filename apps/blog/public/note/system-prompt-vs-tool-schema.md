---
title: "System prompt vs tool schema"
date: 2026-08-17
url: https://blog.duyet.net/note/system-prompt-vs-tool-schema
---

Should the system prompt describe each tool?

No. The model already gets tools as their own field: name, description, JSON schema. Reprinting that list in the system prompt just costs tokens and goes stale.

Use the split:

- **Tool description** — what it does, how to call it, when *this* tool applies or must not.
- **System prompt** — who wins, what order, what never happens. Policy, not a catalog.
- **Code / middleware** — hard stops the model will skip if you only write them in prose.

If a tool never appears in the prompt and still gets called, that is working as designed.
