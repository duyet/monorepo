import { describe, expect, test } from "vitest";
import { apps } from "../src/data/projects";

/**
 * The homepage composes its sections from two hardcoded name lists,
 * `FEATURED` and `MORE_NAMES`, resolved against `apps` by name:
 *
 *     const byName = new Map(apps.map((a) => [a.name, a]));
 *     const featuredProjects = FEATURED.map(({ name }) => {
 *       const item = byName.get(name);
 *       return item ? { item } : null;      // <- silently dropped
 *     }).filter(Boolean);
 *
 * So renaming a project in `data/projects.ts` — or a typo in a name here —
 * **removes it from the homepage with no error anywhere**. The section just
 * renders one card fewer. This test is the only thing standing between a rename
 * and a silently shorter page.
 *
 * The two constants are read out of the route source rather than exported,
 * because exporting them just to test them would widen the module's surface for
 * no runtime benefit, and the failure mode being guarded against is a *source*
 * drift, not a runtime one.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const routeSource = readFileSync(
  join(dirname(fileURLToPath(import.meta.url)), "../src/routes/index.tsx"),
  "utf8",
);

/** The body of a named top-level const, up to the next one. */
function constBlock(constName: string): string {
  const start = routeSource.indexOf(`const ${constName}`);
  if (start === -1) throw new Error(`${constName} not found in index.tsx`);

  const rest = routeSource.slice(start + 1);
  const end = rest.search(/\nconst \w/);
  return end === -1 ? rest : rest.slice(0, end);
}

/**
 * `FEATURED` is a list of objects (`{ name, tag, label }`) and `MORE_NAMES` is
 * a list of bare strings. Extracting both with one regex would sweep up the
 * `tag` and `label` values too, so each shape gets its own match.
 */
function namesIn(constName: string): string[] {
  const block = constBlock(constName);
  const objects = [...block.matchAll(/name: "([^"]+)"/g)].map((m) => m[1]);
  if (objects.length > 0) return objects;

  // Bare-string list: take the quoted literals from the `[...]` only, so a
  // trailing comment or type annotation cannot contribute.
  const list = block.slice(block.indexOf("["));
  return [...list.matchAll(/^\s*"([^"]+)",?$/gm)].map((m) => m[1]);
}

const appNames = new Set(apps.map((a) => a.name));

describe("homepage project curation", () => {
  test("the route still declares both curation lists", () => {
    // Guards the extraction above: if the consts are renamed or removed, this
    // fails loudly instead of the next tests vacuously passing on [].
    expect(namesIn("FEATURED").length).toBeGreaterThan(0);
    expect(namesIn("MORE_NAMES").length).toBeGreaterThan(0);
  });

  test("every FEATURED entry resolves to a project", () => {
    const missing = namesIn("FEATURED").filter((name) => !appNames.has(name));

    // A rename in data/projects.ts lands here.
    expect(missing).toEqual([]);
  });

  test("every MORE_NAMES entry resolves to a project", () => {
    const missing = namesIn("MORE_NAMES").filter((name) => !appNames.has(name));
    expect(missing).toEqual([]);
  });

  test("project names are unique, since the lookup is by name", () => {
    // `new Map(apps.map((a) => [a.name, a]))` keeps the last of a duplicate
    // pair, so a duplicate name would silently pick the wrong one.
    const seen = new Set<string>();
    const dupes = apps.map((a) => a.name).filter((name) => {
      if (seen.has(name)) return true;
      seen.add(name);
      return false;
    });

    expect(dupes).toEqual([]);
  });

  test("the two lists do not overlap", () => {
    // `moreProjects` filters out featured names, so an overlap is not an error
    // — but it means the entry was listed twice for no visible reason.
    const featured = new Set(namesIn("FEATURED"));
    const overlap = namesIn("MORE_NAMES").filter((name) => featured.has(name));
    expect(overlap).toEqual([]);
  });
});
