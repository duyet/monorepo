# CLAUDE.md

Read [docs/ai/internal-knowledge.md](docs/ai/internal-knowledge.md) before changing this repository.

Use semantic commit messages. Keep changes surgical and verify with the narrowest useful command for the touched app or package.
For single-file verification, use `bunx biome lint <path>` before broader app checks.
For dead-code cleanup, verify zero non-test references first with `rg -n "<symbol>" apps packages --glob '!**/*.test.*' --glob '!**/*.spec.*'`.
For root quality checks, use `bun run lint`, `bun run check-types`, and `bun run test`.
For deploy/config workflows, use root scripts (`bun run config`, `bun run deploy`, `bun run cf:deploy`, `bun run cf:deploy:prod`) when needed.
For Rust/WASM workflows, use the documented root commands (`bun run rust:build`, `bun run wasm:build`, `bun run wasm:test`, `bun run wasm:clippy`, `bun run bench:wasm`) only when the touched change requires them.
`AGENTS.md` is a symlink to this file; update `CLAUDE.md` as the canonical instruction entrypoint.

Put durable repository knowledge in `docs/ai/internal-knowledge.md` instead of expanding this file.

## Code-smell / dead-code automation

For scoped reviews after the last run timestamp:

- `git log --since='<LAST_RUN_ISO>' --name-only --pretty=format:'%H%n%s%n%b'` (or `--since='24h ago'`)
- `git show --unified=3 <commit_sha>`
- `rg -n "<symbol>" <file-or-dir> --glob '!**/*.test.*' --glob '!**/__tests__/**'` for dead-reference evidence
- `rg -n "setup-bun@" .github/workflows -g'*.yml'` to verify valid action pins after CI workflow updates
- `rg -n "dtolnay/rust-toolchain@|jetli/wasm-pack-action@" .github/workflows -g'*.yml'` to verify Rust/WASM action refs are SHA-pinned after deploy-workflow changes
- Keep durable findings in `docs/ai/core-memory.md` and list reference docs in `docs/INDEX.md`
- Do not create dated `docs/reviews/code-smell-dead-code-<DATE>.md` files
- `gh run list --branch master --event push --limit 10 --json databaseId,headSha,status,conclusion,name,updatedAt` to confirm post-merge `master` CI is green
