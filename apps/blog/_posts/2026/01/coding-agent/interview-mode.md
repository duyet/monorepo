---
title: Interview Mode
date: 2026-01-01
category: AI
series: AI Harness Engineering
tags:
  - AI
slug: /2026/01/coding-agent/interview-mode
parent: /2026/01/coding-agent
description: Ask clarifying questions before planning complex tasks
---

For complex tasks, try my [`/interview`](https://github.com/duyet/claude-plugins/tree/master/interview) plugin - it asks clarifying questions before you start planning. It helps catch missing requirements early.

```
/plugin install interview@duyet-claude-plugins
```

```
/interview:interview ~/.claude/plans/adaptive-dazzling-lamport.md
```

![Interview](/media/2026/01/ai/cc_interview.png)
