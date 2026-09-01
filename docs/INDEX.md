# Documentation Index

- [`docs/ai/internal-knowledge.md`](ai/internal-knowledge.md): durable repository knowledge for AI agents (static-render rule, latest shadcn + chat primitives, deploy path, gitleaks secret scan, Clerk `@clerk/shared` 3.47 pin). Public-app UI direction lives here; [`DESIGN.md`](../DESIGN.md) is the short companion.
- [`.cursor/skills/verify-blog/`](../.cursor/skills/verify-blog/SKILL.md): project-local blog verification skill (production build + prerendered post HTML). CLI lever: `.cursor/skills/verify-blog/bin/verify-blog`.
- [`.gitleaks.toml`](../.gitleaks.toml): custom secret-scan rules (AnyRouter `sk-ar-v1-` prefix). CI: `.github/workflows/gitleaks.yml`.
- [`docs/ai/cowork-instructions.md`](ai/cowork-instructions.md): guidance for Claude Cowork (desktop agent) sessions on this repo.
- [`docs/ai/writing-style.md`](ai/writing-style.md): how to write blog posts and notes in Duyet's voice.
- [`docs/ai/core-memory.md`](ai/core-memory.md): durable code-smell, dead-code, and CI maintenance memory.
- [`docs/ai/workers-cache.md`](ai/workers-cache.md): Cloudflare Workers Cache rollout — which apps enable `[cache]`, which endpoints set public `Cache-Control` + TTLs, and which stay uncached.
- [`docs/ai/deploy-topology.md`](ai/deploy-topology.md): Pages vs Worker deploy trains, `cf-deploy.ts` change detection (`pnpm-lock.yaml`), and the agent-ui ↔ agent-api race.
- [`docs/ai/duyetbot-automation-flow.md`](ai/duyetbot-automation-flow.md): practical Duyetbot Hermes agent usage guide with setup, prompt examples, channels, and maintenance flows.
- [`docs/REFACTORING.md`](REFACTORING.md): refactoring notes and planning context.
