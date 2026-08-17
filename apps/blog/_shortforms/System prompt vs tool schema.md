---
date: 2026-08-17
title: System prompt vs tool schema
slug: system-prompt-vs-tool-schema
---

Should `agent_system.md` describe each tool?

No. `## Tools` is not a catalog. Tools that never appear there still get called — docstring + JSON schema + the Skill Loading table are enough. Filling the list just adds tokens and drift.

They look duplicated because they are two sibling fields. On Chat Completions with tools already bound: `messages[0]` is policy; `tools[]` is name, docstring, JSON schema. The same `tools[]` is resent every hop unless you defer loading.

Docstring owns WHAT / HOW and that tool's WHEN / WHEN-NOT. `agent_system.md` owns who wins and what order. Middleware owns hard stops — block `delete_repo` unless `confirm: true` is in the args, don't add another paragraph.

I did not strip `## Tools`. That would be a new prompt change, not a note.
