---
title: "Coding agents talk to me now"
date: 2026-06-02
url: https://blog.duyet.net/note/coding-agents-that-talk
---

I gave Codex and Claude Code a voice with [sag.sh](https://sag.sh). When it is stuck and need me, say it out loud.

Now every once in a while I hear the voice talk to me:

> Đây là Claude, có 2 câu hỏi cần bạn trả lời ở project clickhouse monitoring.
> (This is Claude, 2 questions for you on the clickhouse monitoring project.)

or when something's done:

> Hey, this is Claude, the plugins now support English and Vietnamese, pushed to GitHub.


I am wrapped into https://github.com/duyet/codex-claude-plugins/tree/master/sag-notify you can give it a try:

```
/plugin install sag-notify@duyet-claude-plugins
/reload-plugins
/sag-notify:setup
```

Install `sag` with `brew install steipete/tap/sag` and set `ELEVENLABS_API_KEY`.

Coolest thing ever.
