---
title: System prompt vs tool schema
date: 2026-08-17
author: Duyet
category: AI
series: AI Harness Engineering
tags:
  - AI
  - Agents
  - LangGraph
slug: /2026/08/system-prompt-vs-tool-schema
description: "A short note on what belongs in agent_system.md vs tool docstrings."
---

Should `agent_system.md` describe each tool?

No. `## Tools` is already not a catalog. Tools that never appear there still get called — docstring + JSON schema + the Skill Loading table are enough. Filling the list just adds tokens and drift.

They look duplicated because they are two sibling fields, not one prompt.

The table and JSON below are the Chat Completions path with tools already bound. The Responses API uses `input` and a flatter function-tool object. Anthropic Messages also takes top-level `tools[]`; it additionally splices those definitions into a constructed system block. LangChain can defer tool loading, so the full list is not always on every hop.

| Field | How it is built | Role |
| --- | --- | --- |
| `messages[0]` `role: system` | `build_system_prompt()` → `agent_system.md` + skills + catalog + account + datetime | Policy, routing, style |
| `tools[]` | every `@tool` in `create_agent(..., tools=...)` | Name, description (= docstring), JSON schema |

LangChain `ChatOpenAI.bind_tools` emits the OpenAI function-calling shape. With tools bound up front, the same `tools[]` is re-sent on each model call in the turn.

```json
{
  "messages": [{ "role": "system", "content": "..." }],
  "tools": [{ "type": "function", "function": { "name": "...", "description": "...", "parameters": {} } }]
}
```

On one long Chat Completions turn (bound tools, no prompt cache hit) I split `usage.prompt_tokens` by block: history ~82%, system prompt ~10%, tool schemas ~7%. Deleting `## Tools` saved ~2k tokens on that request. That is not the cost lever. On a Flash-Lite-class model it is a quality risk — routing text missing from the system prompt, the model skips a tool at synthesis even when the docstring is still in `tools[]`. I do not have a published eval for that drop; it is a local observation.

## Split of labour

Two altitudes, not two copies of the same WHEN:

- **Tool description** owns that tool's applicability: WHEN / WHEN-NOT for *this* function, arg constraints, "do not use this for X".
- **`agent_system.md`** owns global routing: which tool wins a tie, required sequences, "never catalog every tool here". If `## Tools` has no routing effect, it is optional token weight.

| Place | Job |
| --- | --- |
| Docstring + JSON schema | WHAT / HOW — args, enums, return shape, call examples. Per-tool WHEN / WHEN-NOT. |
| `agent_system.md` routing + optional `## Tools` | Tie-breakers, sequences, global "prefer A over B". Not a reprint of every schema. |
| Both | Selection-time policy on a dangerous tool (delete, sync, complaint). The docstring is what the model reads while picking a function. |
| Middleware, not more prompt | Hard gates the model forgets at synthesis. Example: refuse `delete_*` unless `confirm=true` is already in the tool args — check in middleware, do not hope the prompt holds. |

Anthropic's [tool-writing](https://www.anthropic.com/engineering/writing-tools-for-agents) note puts per-tool WHEN / WHEN-NOT in the description and keeps the system prompt at policy altitude. Same split on OpenAI-shape `tools[]`: the description is still the selection-time text; the system prompt should not restate every schema.

- [Writing tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [Define tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools)
- [Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

I did not strip `## Tools`. That would be a new prompt change, not a note.
