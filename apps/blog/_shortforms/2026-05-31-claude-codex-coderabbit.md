---
date: 2026-05-31
title: Claude + Codex Review + CodeRabbit
slug: claude-codex-coderabbit
---

This is the best combo I am using now.

I am on both Claude Max and Codex Pro. **Claude Code + Codex Review + CodeRabbit** feel like the right pairing, both comment natively inside the PR and give different views of the same problem. The fun part is watching whether they agree or not.

Opus 4.8 feels more honest now. I can see it push back, and sometimes it just rejects a change instead of nodding along.

CodeRabbit is still the best at *finding* the bug, it auto-fix is still a bit off, though.

How I run it:

- **On demand** → Claude Code with `/github:babysit-pr`. It reads through all the review comments and auto-fixes the CI for me.
- **Scheduled** → a Codex automation that reviews daily, merges or resolves issues, and can also fold in CodeRabbit's comments.

Some PRs run long — a lot of back and forth between them until it finally gets the thumbs up:

- [clickhouse-monitoring#1349](https://github.com/duyet/clickhouse-monitoring/pull/1349)
- [clickhouse-monitoring#1355](https://github.com/duyet/clickhouse-monitoring/pull/1355)

![[claude-codex-coderabbit-1.jpeg]]

![[claude-codex-coderabbit-2.jpeg]]

![[claude-codex-coderabbit-3.jpeg]]