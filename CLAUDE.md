# CLAUDE.md

Read [docs/ai/internal-knowledge.md](docs/ai/internal-knowledge.md) before changing this repository.

Use semantic commit messages. Keep changes surgical and verify with the narrowest useful command for the touched app or package.
For root quality checks, use `bun run lint`, `bun run check-types`, and `bun run test`.
For Rust/WASM workflows, use the documented root commands (`bun run rust:build`, `bun run wasm:build`, `bun run wasm:test`, `bun run bench:wasm`) only when the touched change requires them.

Put durable repository knowledge in `docs/ai/internal-knowledge.md` instead of expanding this file.
