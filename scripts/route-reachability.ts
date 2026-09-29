/**
 * Report source files that no entry point can reach.
 *
 * ## Why this exists
 *
 * Roughly 6,300 lines were deleted today by walking the import graph rooted at
 * each app's routes and finding files nothing reached — three Next.js
 * `page.tsx` files that no plugin loads, 32 one-line dither-kit shims whose
 * barrel never referenced them, and two modules whose only consumer had itself
 * been deleted in an earlier cleanup. Every one of those deletions was proven
 * safe by showing the *reachable set* was unchanged before and after.
 *
 * That proof was rebuilt from scratch in four separate passes. This is it once.
 *
 * ## The method, and its one trap
 *
 * This repo uses **TanStack Start file-system routing**. The routing root is
 * `src/routes/`, configured in each `vite.config.ts` as
 * `tanstackStart({ router: { routesDirectory: "./routes" } })`. Nothing resolves
 * `app/` as a routing root, so Next.js-style `app/…/page.tsx` files are
 * unreachable *by construction*.
 *
 * **The trap: roots must include everything the runtime loads that has no import
 * edge.** Omitting any of these produces false positives:
 *   - `src/{client,entry*,router}.tsx`  — the browser/hydration entry
 *   - `functions/**`                    — Cloudflare Pages Functions, loaded by
 *                                          the Pages runtime, not by an import
 *   - `scripts/**` and `migrations/**`  — invoked from `package.json` or CI, and
 *                                          nothing imports them. Without these,
 *                                          `apps/burns/src/lib/freshness.ts`
 *                                          looks dead and is not.
 *
 * Dynamic `import()` is modelled, because `components/charts/LazyCharts.tsx`
 * reaches `CompactChart.tsx` only through `lazy(() => import("./CompactChart"))`.
 * A resolver that misses it flags a live component as dead.
 *
 * ## The other trap
 *
 * An empty or shrunken graph makes every result look perfect. So this script
 * always runs **positive controls** — modules known to be reachable — and exits
 * non-zero if any of them is not. A control that reports dead means the walk is
 * broken, and every other line of its output is worthless.
 *
 * ## Usage
 *
 *   tsx scripts/route-reachability.ts            # every app, report
 *   tsx scripts/route-reachability.ts insights   # one app
 *
 * This reports; it does not fail the build. `route-reachability.test.ts` is the
 * part that guards, and it works by asserting the unreachable set stays a subset
 * of an explicitly recorded list — so cleaning a file up lets you shrink the
 * list, and introducing a new unreachable file fails.
 */

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");

/** Directories never walked. */
const IGNORED_DIRS = new Set([
  ".next",
  ".output",
  ".turbo",
  ".wrangler",
  "coverage",
  "data",
  "dist",
  "kb",
  "node_modules",
  "public",
]);

/**
 * Per-app roots, as patterns relative to the app directory. Each matches either a
 * directory prefix or an exact file, so `"src/client"` covers both
 * `src/client/` and `src/client.tsx`.
 *
 * `scripts` and `migrations` are roots because `package.json` and CI invoke them;
 * nothing imports them. See the header for why omitting them is wrong.
 */
const ROOT_PATTERNS = [
  "src/routes",
  "src/client",
  // `entry-client` / `entry-server` are loaded by the TanStack Start plugin by
  // filename convention, not by an import edge, so each needs its own pattern.
  "src/entry-client",
  "src/entry-server",
  "src/router",
  "app/client",
  "app/entry",
  // Worker and Vite entries. A Cloudflare Worker is loaded by workerd from
  // `wrangler.toml`'s `main`, and a Vite SPA from its configured entry — neither
  // is reachable by an import edge from anywhere.
  "src/index",
  "src/main",
  "src/worker",
  "functions",
  "scripts",
  "migrations",
];

/**
 * Path aliases declared by an app's `tsconfig.json`.
 *
 * These are **not** uniform and must not be hardcoded. Observed in this repo:
 * `@/*` -> `./*` (blog, llm-timeline, insights), `@/*` -> `./src/*` (home),
 * `~/*` -> `./src/*` (agent-ui). Assuming `@/` means "app root" makes every
 * import in `apps/agent-ui` unresolvable, so its entire source reads as
 * unreachable — a 718-line false positive the first time this ran.
 */
function pathAliases(appDir: string): Array<[string, string]> {
  const configPath = join(appDir, "tsconfig.json");
  if (!existsSync(configPath)) return [];
  try {
    // Strip `//` comments, which are not legal JSON.
    const raw = readFileSync(configPath, "utf8").replace(/^\s*\/\/.*$/gm, "");
    const config = JSON.parse(raw) as {
      compilerOptions?: { paths?: Record<string, string[]> };
    };
    const paths = config.compilerOptions?.paths ?? {};
    return Object.entries(paths).flatMap(([pattern, targets]) =>
      targets.map((target) => [pattern, target] as [string, string])
    );
  } catch {
    // A malformed tsconfig is not this script's problem to report; the
    // positive controls are what catch a missed resolution.
    return [];
  }
}

/**
 * `main` from an app's `wrangler.toml`, if present.
 *
 * Workers are bundled from this path by workerd. Without it `apps/api`,
 * `apps/agent-api`, `apps/paid-api` and `apps/news-redirect` report their entire
 * source as unreachable.
 */
function wranglerEntry(appDir: string): string | null {
  const configPath = join(appDir, "wrangler.toml");
  if (!existsSync(configPath)) return null;
  const match = readFileSync(configPath, "utf8").match(/^main\s*=\s*"([^"]+)"/m);
  if (!match) return null;
  const absolute = join(appDir, match[1]);
  return existsSync(absolute) ? absolute : null;
}

/**
 * Build and test configuration, and test harnesses, are not application
 * modules — nothing in the app imports them, so reporting them as unreachable
 * would bury the real findings.
 */
const NON_SOURCE_FILES = new Set([
  "playwright.config.ts",
  "test-setup.ts",
  "test-setup.tsx",
  "vite.config.ts",
  "vite.config.server.ts",
  "vitest.config.ts",
  "vitest.setup.ts",
]);

interface FileSet {
  /** Repo-relative path -> source text. */
  readonly source: Map<string, string>;
}

function readAppFiles(appDir: string): FileSet {
  const source = new Map<string, string>();
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      if (IGNORED_DIRS.has(entry)) continue;
      const full = join(dir, entry);
      if (statSync(full).isDirectory()) {
        walk(full);
        continue;
      }
      if (!/\.tsx?$/.test(entry)) continue;
      // Generated route trees and declaration files are not hand-written
      // source, `.test.` files are never imported by production code, and a
      // `*.config.ts` is build configuration rather than an application module.
      if (entry.endsWith(".gen.ts") || entry.endsWith(".d.ts")) continue;
      if (/\.(test|spec)\.tsx?$/.test(entry)) continue;
      if (entry === "routeTree.gen.ts") continue;
      if (NON_SOURCE_FILES.has(entry)) continue;
      source.set(relative(REPO_ROOT, full), readFileSync(full, "utf8"));
    }
  };
  walk(appDir);
  return { source };
}

/** Resolve an import specifier to a repo-relative file, or null if external. */
function resolveSpecifier(
  specifier: string,
  fromFile: string,
  source: Map<string, string>,
  aliases: Array<[string, string]>,
  appDir: string
): string | null {
  const fromDir = dirname(fromFile);
  let base: string | null = null;

  // Longest alias first, so `~/*` is tried before a bare `~`.
  const sorted = [...aliases].sort((a, b) => b[0].length - a[0].length);
  for (const [pattern, target] of sorted) {
    const star = pattern.indexOf("*");
    if (star === -1) {
      if (specifier !== pattern) continue;
      base = join(appDir, target);
      break;
    }
    const prefix = pattern.slice(0, star);
    const suffix = pattern.slice(star + 1);
    if (!specifier.startsWith(prefix) || !specifier.endsWith(suffix)) continue;
    const middle = specifier.slice(prefix.length, specifier.length - suffix.length);
    base = join(appDir, target.replace("*", middle));
    break;
  }

  if (base === null && specifier.startsWith("@/")) {
    // Fallback for apps whose tsconfig `paths` this script could not read — an
    // `extends` chain, a JSONC construct, or a missing file. `@/` rooted at the
    // app directory is correct for `insights`, `blog` and `llm-timeline`; for
    // `home` it over-reaches slightly, which can only *add* reachable files and
    // so can never invent a dead one.
    //
    // Deliberately a fallback rather than the primary mechanism: `apps/agent-ui`
    // uses `~/*`, and hardcoding `@/` made all 718 of its lines read as dead.
    base = join(appDir, specifier.slice(2));
  }

  if (base === null) {
    if (!specifier.startsWith(".")) {
      // Bare specifier: a package, not a workspace file.
      return null;
    }
    // Worker code writes relative imports with an explicit `.js` extension,
    // because that is what ESM resolution requires at runtime —
    // `from "../lib/insights.js"` resolves to `../lib/insights.ts` on disk. The
    // extension is dropped before the candidate list is built, or every Worker
    // app reports its entire source as unreachable.
    const withoutExtension = specifier.replace(/\.(js|jsx|mjs|cjs)$/, "");
    base = resolve(REPO_ROOT, fromDir, withoutExtension);
  }

  const candidates = [
    base,
    `${base}.ts`,
    `${base}.tsx`,
    join(base, "index.ts"),
    join(base, "index.tsx"),
  ];
  for (const candidate of candidates) {
    const rel = relative(REPO_ROOT, candidate);
    if (source.has(rel)) return rel;
  }
  return null;
}

/**
 * `from "x"`, `from 'x'`, `import("x")`, `import('./x')`, and the backtick form.
 *
 * **Both quote styles are required.** `apps/blog` contains 791 single-quoted
 * imports; matching only double quotes made `CornerDecoration.tsx` read as dead
 * when `NoteCard.tsx` imports it as `from './CornerDecoration'`. A module
 * reachable only through a single-quoted import is a *false positive*, and
 * false positives are the one failure mode that makes this script dangerous:
 * they name real files with a confident "unreachable" verdict.
 */
const IMPORT_PATTERNS =
  /from\s*"([^"]+)"|from\s*'([^']+)'|import\(\s*"([^"]+)"\s*\)|import\(\s*'([^']+)'\s*\)|import\(\s*`([^`]+)`\s*\)/g;

function importsOf(
  file: string,
  source: Map<string, string>,
  aliases: Array<[string, string]>,
  appDir: string
): string[] {
  const text = source.get(file) ?? "";
  const out: string[] = [];
  for (const match of text.matchAll(IMPORT_PATTERNS)) {
    const resolved = resolveSpecifier(
      match[1] ?? match[2] ?? match[3] ?? match[4] ?? match[5] ?? "",
      file,
      source,
      aliases,
      appDir
    );
    if (resolved) out.push(resolved);
  }
  return out;
}

/**
 * Modules that must be reachable. If any of these comes back unreachable the
 * walk is broken, so every other result it produced is discarded.
 *
 * Each one is here because getting it wrong has already happened: the dither-kit
 * barrel is reached only through `components/overview/charts.tsx`; the layouts
 * barrel was dead while `InsightsPageShell` beside it was live; and
 * `CompactChart` is reached only through a `lazy()` edge.
 */
export const POSITIVE_CONTROLS: Record<string, string[]> = {
  insights: [
    "src/routes/index.tsx",
    "src/routes/ai/index.tsx",
    "components/overview/charts.tsx",
    "components/dither-kit/index.ts",
    "components/layouts/InsightsPageShell.tsx",
    "components/charts/index.tsx",
    "components/charts/LazyCharts.tsx",
    "components/charts/CompactChart.tsx",
  ],
  home: ["src/routes/index.tsx", "src/components/HomeHero.tsx"],
  blog: [
    "src/routes/index.tsx",
    "lib/head.ts",
    // Reachable only because `NoteCard.tsx` imports it with **single quotes**.
    // This control exists specifically so the single-quoted-import case cannot
    // regress: without it, `CornerDecoration.tsx` reported as dead and looked
    // like a real finding.
    "components/blog/CornerDecoration.tsx",
  ],
  "llm-timeline": ["src/routes/index.tsx", "components/StaticView.tsx"],
  photos: ["src/routes/index.tsx", "components/PhotoGrid.tsx"],
  homelab: ["src/routes/index.tsx", "hooks/useDashboard.ts"],
  // Worker apps: the entry comes from `wrangler.toml`, and these must be found
  // or the whole app reads as unreachable.
  api: ["src/index.ts", "src/lib/insights.ts", "src/routes/insights.ts"],
  "agent-api": ["src/index.ts", "src/http.ts", "src/tools.ts"],
  "agent-ui": ["src/main.tsx", "src/App.tsx"],
};

export interface ReachabilityReport {
  readonly app: string;
  readonly totalFiles: number;
  readonly reachable: readonly string[];
  readonly unreachable: readonly string[];
  /** Control modules that came back unreachable — a non-empty list voids the run. */
  readonly brokenControls: readonly string[];
}

export function analyzeApp(app: string): ReachabilityReport {
  const appDir = join(REPO_ROOT, "apps", app);
  const { source } = readAppFiles(appDir);
  if (source.size === 0) throw new Error(`no source found for app "${app}"`);

  const roots: string[] = [];
  for (const pattern of ROOT_PATTERNS) {
    const base = join(appDir, pattern);
    // The pattern may name a directory (`src/routes`), an exact file
    // (`src/client`), or a file without its extension (`src/client` ->
    // `src/client.tsx`). Try all three.
    const asFile = [base, `${base}.ts`, `${base}.tsx`].find((candidate) =>
      existsSync(candidate) && !statSync(candidate).isDirectory()
    );
    if (asFile) {
      const rel = relative(REPO_ROOT, asFile);
      if (source.has(rel)) roots.push(rel);
    }
    if (existsSync(base) && statSync(base).isDirectory()) {
      // Directory prefix: every module beneath it is a root.
      const prefix = `${relative(REPO_ROOT, base)}/`;
      for (const file of source.keys()) {
        if (file.startsWith(prefix)) roots.push(file);
      }
    }
  }

  const workerEntry = wranglerEntry(appDir);
  if (workerEntry) {
    const rel = relative(REPO_ROOT, workerEntry);
    if (source.has(rel)) roots.push(rel);
  }

  const aliases = pathAliases(appDir);
  const reachable = new Set<string>();
  const stack = [...roots];
  while (stack.length > 0) {
    const file = stack.pop() as string;
    if (reachable.has(file)) continue;
    reachable.add(file);
    stack.push(...importsOf(file, source, aliases, appDir));
  }

  const unreachable = [...source.keys()]
    .filter((file) => !reachable.has(file))
    .sort();

  return {
    app,
    totalFiles: source.size,
    reachable: [...reachable].sort(),
    unreachable,
    brokenControls: (POSITIVE_CONTROLS[app] ?? [])
      // Controls are written app-relative for readability; keys are repo-relative.
      .map((control) => relative(REPO_ROOT, join(appDir, control)))
      .filter((control) => !reachable.has(control)),
  };
}

function appsOnDisk(): string[] {
  return readdirSync(join(REPO_ROOT, "apps"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .filter((name) =>
      existsSync(join(REPO_ROOT, "apps", name, "package.json"))
    )
    .sort();
}

function main(): void {
  const requested = process.argv.slice(2);
  const apps = requested.length > 0 ? requested : appsOnDisk();

  let voided = false;
  for (const app of apps) {
    let report: ReachabilityReport;
    try {
      report = analyzeApp(app);
    } catch (error) {
      console.log(`${app}: skipped (${(error as Error).message})`);
      continue;
    }

    const lines = report.unreachable.reduce((total, file) => {
      const text = readFileSync(join(REPO_ROOT, file), "utf8");
      return total + text.split("\n").length;
    }, 0);

    console.log(
      `\n${app}: ${report.totalFiles} files, ${report.reachable.length} reachable, ` +
        `${report.unreachable.length} unreachable (${lines} lines)`
    );

    if (report.brokenControls.length > 0) {
      // The walk is broken, so do not present the rest as a finding.
      voided = true;
      console.log(
        `  POSITIVE CONTROL FAILED — these are known-reachable modules the walk ` +
          `could not find, so every other result for ${app} is discarded:`
      );
      for (const control of report.brokenControls) {
        console.log(`    ${control}`);
      }
      continue;
    }

    for (const file of report.unreachable) console.log(`    ${file}`);
  }

  if (voided) process.exitCode = 1;
}

// `import.meta.url` is an object only under ESM.
if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("route-reachability.ts")
) {
  main();
}

