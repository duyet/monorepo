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

| Field | How it is built | Role |
| --- | --- | --- |
| `messages[0]` `role: system` | `build_system_prompt()` → `agent_system.md` + skills + catalog + account + datetime | Policy, routing, style |
| `tools[]` | every `@tool` in `create_agent(..., tools=...)` | Name, description (= docstring), JSON schema |

LangChain `ChatOpenAI.bind_tools` emits the OpenAI function-calling shape. Nothing registers once and then drops out — the same `tools[]` is re-sent on every hop.

```json
{
  "messages": [{ "role": "system", "content": "..." }],
  "tools": [{ "type": "function", "function": { "name": "...", "description": "...", "parameters": {} } }]
}
```

On a long turn I measured roughly: history ~82%, system prompt ~10%, tool schemas ~7%. Deleting `## Tools` saves ~2k tokens per hop. That is not the cost lever. On flash-lite it is a quality risk.

## Split of labour

| Place | Job |
| --- | --- |
| Docstring + JSON schema | WHAT / HOW — args, enums, return shape, call examples |
| `agent_system.md` routing table + `## Tools` | WHEN / WHEN-NOT / which tool wins / sequences |
| Both | Selection-time policy on a dangerous tool (delete, sync, complaint). The docstring is what the model reads while picking a function. |
| Middleware, not more prompt | Rules flash-lite drops at synthesis |

Anthropic's guidance matches this: put WHEN and WHEN-NOT in the tool description; keep the system prompt at the right altitude, not a reprint of every schema.

- [Writing tools for agents](https://www.anthropic.com/engineering/writing-tools-for-agents)
- [Define tools](https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools)
- [Effective context engineering](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)

Anthropic's API is the odd one that splices tools into a constructed system prompt. OpenAI-shape `tools[]` is a real separate field.

I did not strip `## Tools`. That would be a new prompt change, not a note.
