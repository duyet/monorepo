# CLAUDE.md

Read [docs/ai/internal-knowledge.md](docs/ai/internal-knowledge.md) before changing this repository.

Use semantic commit messages. Keep changes surgical and verify with the narrowest useful command for the touched app or package.
For single-file verification, use `bunx biome lint <path>` before broader app checks.
For root quality checks, use `bun run lint`, `bun run check-types`, and `bun run test`.
For deploy/config workflows, use root scripts (`bun run config`, `bun run deploy`, `bun run cf:deploy`, `bun run cf:deploy:prod`) when needed.
For Rust/WASM workflows, use the documented root commands (`bun run rust:build`, `bun run wasm:build`, `bun run wasm:test`, `bun run wasm:clippy`, `bun run bench:wasm`) only when the touched change requires them.

Put durable repository knowledge in `docs/ai/internal-knowledge.md` instead of expanding this file.
