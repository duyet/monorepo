/**
 * Fails when `pnpm-lock.yaml` does not match the workspace `package.json`
 * files.
 *
 * ## Why this exists
 *
 * A commit in this session added `@duyet/config` to several apps'
 * `package.json` without regenerating the lockfile. Nothing local noticed:
 * `pnpm install` (without `--frozen-lockfile`) silently updates the lockfile,
 * so a developer's machine heals the problem and the staleness is invisible
 * until CI.
 *
 * **All 18 workflows in `.github/workflows/` install with `--frozen-lockfile`**,
 * so that single omission would have failed every one of them at once —
 * `lint`, `test`, `checks`, `cf-deploy`, `cf-worker-deploy`,
 * `data-sync-backfill`, `kb-submodule-sync` and the rest. It was caught only
 * by accident, by a subagent working in a fresh worktree where `--frozen-
 * lockfile` was the only option available to it.
 *
 * ## Why a script and not a test
 *
 * `--lockfile-only --frozen-lockfile` does not write: on a stale lockfile it
 * exits non-zero instead of repairing it, which is what makes it safe to run
 * against a working tree. It does reach the registry to resolve, so it is a
 * pre-commit/CI concern rather than something to run inside `test:scripts`,
 * where a flaky network would produce a confusing red test.
 *
 * `--lockfile-only` matters for the same reason: without it pnpm would want to
 * write, and this check must never be the thing that modifies a working tree.
 */
import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

/**
 * Run `pnpm install --frozen-lockfile --lockfile-only` in the repo root.
 *
 * Returns the combined output rather than throwing, so the caller decides how
 * to present the failure — a stale lockfile is a normal, recoverable state and
 * the message should say what to do about it.
 */
export function checkLockfile(root: string = ROOT): {
  ok: boolean;
  output: string;
} {
  try {
    const output = execFileSync(
      "pnpm",
      ["install", "--frozen-lockfile", "--lockfile-only"],
      { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
    );
    return { ok: true, output };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string; status?: number };
    return {
      ok: false,
      output: [err.stdout, err.stderr].filter(Boolean).join("\n") ||
        `pnpm exited with status ${err.status}`,
    };
  }
}

/** The message shown when the lockfile is out of date. */
export function stalenessMessage(output: string): string {
  return [
    "pnpm-lock.yaml is out of date with the workspace package.json files.",
    "",
    "Every workflow in .github/workflows installs with --frozen-lockfile, so CI",
    "will fail until this is fixed. Run:",
    "",
    "  pnpm install",
    "",
    "and commit the resulting pnpm-lock.yaml alongside the package.json change",
    "that caused the drift.",
    "",
    "pnpm said:",
    output.trim(),
  ].join("\n");
}

/** Entry point for `pnpm run check-lockfile`. */
function main(): void {
  const { ok, output } = checkLockfile();
  if (!ok) {
    console.error(stalenessMessage(output));
    process.exit(1);
  }
  console.log("pnpm-lock.yaml is up to date with the workspace manifests.");
}

if (process.argv[1]?.endsWith("check-lockfile.ts")) {
  main();
}
