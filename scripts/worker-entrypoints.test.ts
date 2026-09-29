import { build } from "esbuild";
import { describe, expect, test } from "vitest";

/**
 * Every Worker entrypoint in this repo runs under `wrangler dev` / `wrangler
 * deploy`, which resolves modules through esbuild with **workerd** conditions.
 * The unit tests resolve them through Vite, with **browser** conditions and
 * through vitest's own transform. Those are three different resolvers, and they
 * do not agree.
 *
 * That gap is not theoretical. Commit `00f6520b` imported `wakatimeConfig` from
 * the `@duyet/config` barrel, and every test passed while
 * `tsx src/index.ts` — the whole data-sync CLI — threw
 * `SyntaxError: The requested module '@duyet/config' does not provide an export
 * named 'wakatimeConfig'`. A sibling entrypoint could have failed the same way
 * and the suite would not have noticed.
 *
 * So: bundle each entrypoint the way the deployer does and assert the bundle
 * succeeds. That catches a specifier which resolves in one environment and not
 * another — the class of failure that unit tests structurally cannot see.
 *
 * This is a *build* smoke test, not a runtime one. It will not catch a missing
 * binding or a bad `wrangler.toml`. Catching those needs
 * `@cloudflare/vitest-pool-workers`, which this repo does not have configured.
 */

interface Entrypoint {
  app: string;
  entry: string;
  /** Specifiers workerd provides natively; never bundle them. */
  external?: string[];
}

/**
 * Node builtins workerd supplies when `compatibility_flags = ["nodejs_compat"]`
 * is set (it is, in `agent-api` and `paid-api`). esbuild has no way to know
 * that, so they are externalized here. The bare names are needed as well as
 * the `node:`-prefixed ones: a dependency reaching for `url` or `path` gets the
 * unprefixed specifier.
 */
const NODE_BUILTINS = [
  "assert", "async_hooks", "buffer", "crypto", "diagnostics_channel",
  "events", "fs", "http", "https", "module", "net", "os", "path", "process",
  "stream", "string_decoder", "timers", "tls", "tty", "url", "util", "v8",
  "vm", "worker_threads", "zlib",
];

/**
 * The four Workers. `apps/data-sync` is deliberately **not** here: it is a Node
 * CLI run by `tsx`, not a Worker, so it resolves the full Node builtin set
 * (`punycode` and friends) that this bundle configuration does not provide. Its
 * entrypoint has its own smoke test in
 * `apps/data-sync/src/lib/__tests__/config-imports.test.ts`, which runs it the
 * way CI does.
 */
const ENTRYPOINTS: Entrypoint[] = [
  { app: "api", entry: "apps/api/src/index.ts", external: ["cloudflare:*"] },
  {
    app: "agent-api",
    entry: "apps/agent-api/src/index.ts",
    external: ["cloudflare:*", "@cloudflare/ai-chat"],
  },
  {
    app: "paid-api",
    entry: "apps/paid-api/src/index.ts",
    external: ["cloudflare:*"],
  },
  { app: "news-redirect", entry: "apps/news-redirect/src/index.ts" },
];

async function bundle({ entry, external }: Entrypoint): Promise<string[]> {
  const errors: string[] = [];
  try {
    await build({
      entryPoints: [entry],
      bundle: true,
      write: false,
      format: "esm",
      // What `wrangler deploy` does, as far as a bundler is concerned.
      platform: "neutral",
      target: "es2022",
      conditions: ["workerd", "worker", "browser"],
      mainFields: ["module", "main"],
      external: [
        ...(external ?? []),
        "sharp",
        ...NODE_BUILTINS,
        ...NODE_BUILTINS.map((n) => `node:${n}`),
      ],
      logLevel: "silent",
    });
  } catch (error) {
    for (const e of (error as { errors?: { text: string }[] }).errors ?? []) {
      errors.push(e.text);
    }
    if (errors.length === 0) errors.push(String(error));
  }
  return errors;
}

describe("Worker entrypoints bundle under workerd conditions", () => {
  for (const entrypoint of ENTRYPOINTS) {
    test(`${entrypoint.app}: ${entrypoint.entry}`, async () => {
      const errors = await bundle(entrypoint);
      // The full error text is the point: a bare "failed" would not say which
      // specifier broke, which is the only thing anyone needs.
      expect(errors.join("\n")).toBe("");
    }, 30_000);
  }
});
