import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { APP_REGISTRY, getRegistryOrigins } from "../packages/urls/src/app-registry";
import { discoverPagesApps, domainForApp } from "./cf-pages-apps";

/**
 * Two systems enumerate the production apps, and they key them differently:
 *
 * - `discoverPagesApps()` reads the filesystem: any `apps/*` with
 *   `pages_build_output_dir` and a `cf:deploy:prod` script. Keys are
 *   **directory names** — `agent-ui`, `burns`.
 * - `APP_REGISTRY` is hand-maintained and calls itself the "single source of
 *   truth for production origins". Keys are **its own ids** — `agents`, `burn` —
 *   with the directory name kept separately in `repoDir`.
 *
 * Nothing checked the join. An app added to `apps/` and deployed but missing
 * from the registry would be live and absent from every nav, every
 * `AppSwitcher` and every allowed-origin list, with no error anywhere.
 */

// `scripts/` sits directly under the repo root, so one `..` — not two.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const deployed = Object.keys(discoverPagesApps());

/** Names a registry entry can be matched by: its id, or its repo directory. */
const registryNames = new Set(
  APP_REGISTRY.flatMap((e) => [e.id, e.repoDir].filter(Boolean) as string[]),
);

describe("deployed apps vs the app registry", () => {
  test("the filesystem discovery found something", () => {
    // Otherwise the next test passes vacuously on an empty list.
    expect(deployed.length).toBeGreaterThan(0);
    expect(APP_REGISTRY.length).toBeGreaterThan(0);
  });

  test("every deployable Pages app is in the registry", () => {
    expect(deployed.filter((name) => !registryNames.has(name))).toEqual([]);
  });

  test("every registry entry points at a real app directory", () => {
    // The inverse direction: a registry entry for an app that no longer exists
    // puts a dead link in the nav and a dead origin in the allowlist.
    //
    // Checked against the filesystem rather than `discoverPagesApps()`, because
    // `repoDir` may name a *Worker* app too — `news` points at `news-redirect`,
    // which has no `pages_build_output_dir` and would look dangling otherwise.
    const dangling = APP_REGISTRY.filter(
      (e) => e.repoDir && !existsSync(join(ROOT, "apps", e.repoDir)),
    ).map((e) => `${e.id} -> ${e.repoDir}`);
    expect(dangling).toEqual([]);
  });

  test("a repoDir is never claimed by two registry entries", () => {
    const byRepoDir = new Map<string, string[]>();
    for (const e of APP_REGISTRY) {
      if (!e.repoDir) continue;
      byRepoDir.set(e.repoDir, [...(byRepoDir.get(e.repoDir) ?? []), e.id]);
    }
    expect(
      [...byRepoDir]
        .filter(([, ids]) => ids.length > 1)
        .map(([dir, ids]) => `${dir}: ${ids.join(", ")}`),
    ).toEqual([]);
  });

  test("every registry href has its origin in the Clerk allowlist", () => {
    // `getRegistryOrigins` is what the Workers authorize against. Compared on
    // the *origin*, not the href: `about`, `projects` and `ls` are sub-routes of
    // `duyet.net`, so their hrefs carry a path the allowlist deliberately drops.
    const allowed = new Set(getRegistryOrigins());
    expect(
      APP_REGISTRY.filter(
        (e) => !allowed.has(`${new URL(e.href).protocol}//${new URL(e.href).host}`),
      ).map((e) => `${e.id}: ${e.href}`),
    ).toEqual([]);
  });
});

describe("domain resolution agrees between the two systems", () => {
  test("the deployer's health-check address matches the registry host", () => {
    // `domainForApp` is what `cf-deploy.yml` curls after deploying, so a
    // mismatch means CI probes an address that is not the one users reach.
    const mismatched = deployed
      .map((name) => {
        const entry = APP_REGISTRY.find(
          (e) => e.id === name || e.repoDir === name,
        );
        return entry
          ? { name, deploy: domainForApp(name), host: entry.host }
          : null;
      })
      .filter((x): x is { name: string; deploy: string; host: string } => x !== null)
      .filter((x) => x.deploy !== x.host)
      .map((x) => `${x.name}: deployer says ${x.deploy}, registry says ${x.host}`);

    // KNOWN, pinned deliberately: `burns` carries
    // `PAGES_DOMAIN_OVERRIDES.burns = "duyet-burns.pages.dev"`, so the health
    // check curls the Pages project URL rather than the `burn.duyet.net` custom
    // domain that the registry, the referral list, the homepage project data
    // and llms.txt all call canonical. Both resolve 200 today, so nothing is
    // broken — but the override looks stale, and removing it would change what
    // CI probes, which is a deploy-behaviour decision rather than a cleanup.
    expect(mismatched).toEqual([
      "burns: deployer says duyet-burns.pages.dev, registry says burn.duyet.net",
    ]);
  });
});
