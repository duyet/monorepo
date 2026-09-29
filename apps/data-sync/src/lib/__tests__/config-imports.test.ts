/**
 * Why this file exists.
 *
 * Commit `00f6520b` extracted a shared WakaTime transport that reads
 * `wakatimeConfig` from `@duyet/config`. Every test passed and the whole
 * data-sync CLI was broken:
 *
 *     $ pnpm exec tsx src/index.ts sync wakatime --dry-run
 *     SyntaxError: The requested module '@duyet/config' does not provide an
 *     export named 'wakatimeConfig'
 *
 * The cause is a resolution asymmetry that only shows up outside Vite:
 *
 * - `@duyet/config` declares no `"type": "module"`, so `tsx` loads it as CJS.
 * - Node's `cjs-module-lexer` can enumerate the named exports of a *single* CJS
 *   module, but not those reached through an `export * from` re-export chain.
 * - `packages/config/src/index.ts` is five `export * from` lines.
 * - So a *static named* ESM import from the barrel sees `{ default }` only.
 *
 * Everything else masks it: Vite resolves the barrel through its own pipeline
 * (insights and homelab are fine), `require("@duyet/config")` works fine, and
 * `vitest` transforms the graph itself. Only `tsx`-run entrypoints — which is
 * every data-sync CLI invocation, and every `pnpm run sync` in CI — see it.
 *
 * These tests run the *real* module graph through `tsx`, which is the only way
 * to catch it. A unit test that imported the same symbol would pass, because
 * vitest resolves it differently.
 */

import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";

// src/lib/__tests__ -> src/lib -> src -> apps/data-sync
const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), "../../..");

/**
 * Run a throwaway script through `tsx` and return its stdout.
 *
 * The probe file is written **inside the app directory**, not a tmpdir: Node
 * resolves a bare specifier relative to the importing file, so a probe under
 * `/tmp` cannot see `@duyet/config` at all and would report
 * `ERR_MODULE_NOT_FOUND` instead of the export error under test.
 *
 * A real file rather than `tsx -e`, because `tsx -e` resolves the barrel
 * correctly — which is precisely how this bug stayed hidden.
 */
function runThroughTsx(source: string): string {
  const { rmSync, writeFileSync } = require("node:fs") as typeof import("node:fs");
  const file = join(APP_DIR, `__probe-${process.pid}-${probeCounter++}.mts`);
  try {
    writeFileSync(file, source);
    return execFileSync("pnpm", ["exec", "tsx", file], {
      cwd: APP_DIR,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } finally {
    rmSync(file, { force: true });
  }
}

let probeCounter = 0;

describe("@duyet/config import shape", () => {
  test("a static named import from the barrel does NOT work under tsx", () => {
    // This is the trap, asserted so the reason the subpath is used is recorded
    // and stays true. If `@duyet/config` ever gains `"type": "module"` or a real
    // build, this test fails and the three subpath imports can be reverted.
    let failed = false;
    try {
      runThroughTsx(
        'import { wakatimeConfig } from "@duyet/config";\nconsole.log(wakatimeConfig);\n',
      );
    } catch (error) {
      failed = true;
      const err = error as { stderr?: string; message?: string };
      expect(String(err.stderr ?? err.message ?? error)).toContain(
        "does not provide an export named 'wakatimeConfig'",
      );
    }
    expect(failed).toBe(true);
  });

  test("a static named import from the subpath DOES work under tsx", () => {
    const out = runThroughTsx(
      'import { wakatimeConfig } from "@duyet/config/api";\nconsole.log(wakatimeConfig.baseUrl);\n',
    );
    expect(out.trim()).toBe("https://wakatime.com/api/v1");
  });

  test("a namespace import of the barrel does not work either", () => {
    // Stronger than the named-import case: the namespace arrives with `default`
    // and nothing else, so `config.wakatimeConfig` is `undefined` at runtime
    // rather than a load-time SyntaxError. The subpath is therefore the only
    // shape that works from a tsx-run ESM entrypoint, not merely the tidier one.
    let error = "";
    try {
      runThroughTsx(
        'import * as config from "@duyet/config";\nconsole.log(config.wakatimeConfig.baseUrl);\n',
      );
    } catch (thrown) {
      const err = thrown as { stderr?: string; message?: string };
      error = String(err.stderr ?? err.message ?? thrown);
    }
    expect(error).toContain("baseUrl");
    expect(error).toMatch(/undefined/);
  });

  test("the barrel is fine under require(), which is why CJS consumers work", () => {
    // Records the other half of the asymmetry: nothing is wrong with the
    // barrel's own exports, only with how Node reads them from ESM.
    const out = runThroughTsx(
      'import { createRequire } from "node:module";\nconst require = createRequire(import.meta.url);\nconsole.log(require("@duyet/config").wakatimeConfig.baseUrl);\n',
    );
    expect(out.trim()).toBe("https://wakatime.com/api/v1");
  });
});

describe("the CLI entrypoint", () => {
  test("starts, which is what the SyntaxError prevented", () => {
    // `src/index.ts` dispatches on argv[2]. An unknown command reaches the
    // "Unknown command" path *after* the whole module graph has loaded and
    // after argument parsing, so getting there proves every import resolved.
    let output = "";
    let code = 0;
    try {
      output = execFileSync("pnpm", ["exec", "tsx", "src/index.ts", "nope"], {
        cwd: APP_DIR,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
      });
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string; status?: number };
      output = `${err.stdout ?? ""}${err.stderr ?? ""}`;
      code = err.status ?? 1;
    }

    expect(output).not.toContain("does not provide an export named");
    expect(output).toContain("Unknown command");
    expect(code).toBe(1);
  });

  test("`pnpm run sync <source>` -- the exact CI invocation -- resolves its imports", () => {
    // This is the command shape every `data-sync-*.yml` workflow runs. An
    // unknown source is enough: it fails at validation, after the graph loads,
    // and never opens a network connection.
    let output = "";
    let code = 0;
    try {
      output = execFileSync(
        "pnpm",
        ["exec", "tsx", "src/commands/sync.ts", "not-a-real-source", "--dry-run"],
        { cwd: APP_DIR, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
      );
    } catch (error) {
      const err = error as { stdout?: string; stderr?: string; status?: number };
      output = `${err.stdout ?? ""}${err.stderr ?? ""}`;
      code = err.status ?? 1;
    }

    expect(output).not.toContain("does not provide an export named");
    expect(output).toContain("Invalid sources");
    expect(code).toBe(1);
  });
});
