import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { DEFAULT_APPS_DIR, discoverPagesApps } from "./cf-pages-apps.ts";
import {
  firstTomlString,
  isPagesProject,
  readPagesOutputDir,
} from "./wrangler-toml.ts";

function makeApp(wrangler: string): string {
  const root = mkdtempSync(join(tmpdir(), "wrangler-toml-"));
  mkdirSync(join(root, "app"));
  writeFileSync(join(root, "app", "wrangler.toml"), wrangler);
  return join(root, "app");
}

describe("firstTomlString", () => {
  it("reads a top-level string value", () => {
    expect(firstTomlString('name = "duyet-kb"', "name")).toBe("duyet-kb");
  });

  it("finds the key at any line, not just the first", () => {
    const toml = 'compatibility_date = "2026-01-01"\nname = "duyet-kb"\n';
    expect(firstTomlString(toml, "name")).toBe("duyet-kb");
  });

  it("ignores a commented-out assignment", () => {
    // Anchoring to line start is the point: a commented or indented key must
    // not be read as the real value, or the deploy would target a directory
    // the app does not build into.
    expect(
      firstTomlString(
        '# pages_build_output_dir = "nope"',
        "pages_build_output_dir"
      )
    ).toBeUndefined();
  });

  it("returns undefined for a missing key", () => {
    expect(
      firstTomlString('name = "x"', "pages_build_output_dir")
    ).toBeUndefined();
  });
});

describe("readPagesOutputDir", () => {
  it("returns undefined for a directory with no wrangler.toml", () => {
    const root = mkdtempSync(join(tmpdir(), "wrangler-toml-"));
    expect(readPagesOutputDir(join(root, "missing"))).toBeUndefined();
  });

  it("returns undefined for a Worker (no pages_build_output_dir)", () => {
    const app = makeApp('name = "duyet-agents-api"\nmain = "src/index.ts"\n');
    expect(readPagesOutputDir(app)).toBeUndefined();
    expect(isPagesProject(app)).toBe(false);
  });

  it("reads the output dir for a Pages app", () => {
    const app = makeApp(
      'name = "duyet-kb"\npages_build_output_dir = "dist/client"\n'
    );
    expect(readPagesOutputDir(app)).toBe("dist/client");
    expect(isPagesProject(app)).toBe(true);
  });

  it("agrees with app discovery for every real Pages app", () => {
    // The two consumers of this file (discovery and the per-app production
    // deploy) must never disagree about where an app's build lands.
    const apps = discoverPagesApps(DEFAULT_APPS_DIR);
    for (const [name, app] of Object.entries(apps)) {
      expect(readPagesOutputDir(join(DEFAULT_APPS_DIR, name))).toBe(
        app.outputDir
      );
    }
  });
});
