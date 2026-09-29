import { describe, expect, test } from "vitest";
import { getMasonryClasses, MASONRY_CONFIG } from "@/lib/GridUtilities";

/**
 * `components/PhotoGrid.tsx` imports exactly two things from this module:
 * `MASONRY_CONFIG.breakpoints` (forwarded to `react-masonry-css`'s
 * `breakpointCols`) and `getMasonryClasses()`.
 *
 * This file used to be 261 lines and the other ~185 were unreachable — sorting,
 * filtering, year grouping, item dimension maths and a preload policy, none of
 * it called from anywhere. `MASONRY_CONFIG.gutter` and `.animation` are the
 * clearest case: nothing read them, and the only reader was a test asserting
 * `gutter.mobile === "16px"`, i.e. a literal compared against itself.
 *
 * So the tests now cover what the app actually uses, plus a guard that keeps
 * unreachable exports from creeping back.
 */

describe("MASONRY_CONFIG.breakpoints", () => {
  test("has a `default` fallback, which react-masonry-css needs", () => {
    // `default` is the column count above the largest breakpoint. Without it
    // the gallery renders with no columns at all on a wide monitor, and it
    // cannot be inferred from the other keys.
    expect(MASONRY_CONFIG.breakpoints.default).toBeGreaterThan(0);
  });

  test("gives more columns to wider viewports, and `default` the most", () => {
    // `react-masonry-css` treats each key as a **min-width** and `default` as
    // the fallback above the largest one. So columns increase with width:
    // 640px->1, 768px->2, ... 1920px->6, default->7.
    const { breakpoints } = MASONRY_CONFIG;
    const widths = Object.keys(breakpoints)
      .filter((key) => key !== "default")
      .map(Number)
      .sort((a, b) => a - b);

    expect(widths.length).toBeGreaterThan(1);
    for (let i = 1; i < widths.length; i += 1) {
      expect(
        breakpoints[String(widths[i])],
        `${widths[i]}px should not have fewer columns than ${widths[i - 1]}px`,
      ).toBeGreaterThanOrEqual(breakpoints[String(widths[i - 1])]);
    }

    expect(breakpoints.default).toBeGreaterThanOrEqual(
      breakpoints[String(widths.at(-1) as number)],
    );
  });

  test("never drops below one column", () => {
    for (const [key, cols] of Object.entries(MASONRY_CONFIG.breakpoints)) {
      expect(cols, key).toBeGreaterThanOrEqual(1);
    }
  });

  test("has no duplicate viewport widths", () => {
    const keys = Object.keys(MASONRY_CONFIG.breakpoints);
    expect(new Set(keys).size).toBe(keys.length);
  });
});

describe("getMasonryClasses", () => {
  test("returns the container and column classes", () => {
    expect(getMasonryClasses()).toEqual({
      container: "flex w-full gap-3 sm:gap-4",
      column: "bg-clip-padding",
    });
  });

  test("is stable across calls, since PhotoGrid hoists it to module scope", () => {
    // `PhotoGrid.tsx` evaluates this once at import. If it were not pure the
    // hoisted value would go stale relative to the class strings in use.
    expect(getMasonryClasses()).toEqual(getMasonryClasses());
  });
});

describe("reachability", () => {
  test("nothing here is exported for nobody", () => {
    // The check that would have caught the 185 dead lines. Reads the app and
    // fails if a name this module exports has no consumer outside itself and
    // its own test file.
    const { readFileSync, readdirSync, statSync } = require("node:fs") as
      typeof import("node:fs");
    const { dirname, join } = require("node:path") as typeof import("node:path");
    const { fileURLToPath } = require("node:url") as typeof import("node:url");

    const appDir = join(dirname(fileURLToPath(import.meta.url)), "../..");
    const here = join(appDir, "lib/GridUtilities.ts");

    // Handles both shapes: `export const x`, `export function x`,
    // `export interface x`, and a trailing `export { a, b }` re-export list.
    const source = readFileSync(here, "utf8");
    const declared = [...source.matchAll(
      /^export\s+(?:declare\s+)?(?:async\s+)?(?:const|let|var|function|class|interface|type|enum)\s+(\w+)/gm,
    )].map((m) => m[1]);
    const reexported = [...source.matchAll(/^export\s*\{([^}]*)\}/gm)].flatMap(
      (m) =>
        m[1]
          .split(",")
          .map((part) => part.trim().split(/\s+as\s+/).pop() ?? "")
          .filter(Boolean),
    );
    const exported = [...new Set([...declared, ...reexported])];

    expect(exported.length).toBeGreaterThan(0);

    const appFiles: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        if (entry === "node_modules" || entry === "dist" || entry === ".output") {
          continue;
        }
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
          walk(full);
        } else if (/\.tsx?$/.test(entry) && !/\.test\.tsx?$/.test(entry)) {
          appFiles.push(full);
        }
      }
    };
    walk(appDir);

    const orphaned = exported.filter(
      (name) =>
        !appFiles.some((file) => {
          if (file === here) return false;
          return new RegExp(`\\b${name}\\b`).test(readFileSync(file, "utf8"));
        }),
    );

    expect(orphaned).toEqual([]);
  });

  test("does not re-export a year grouper that lives elsewhere", () => {
    // `groupPhotosByYear` existed here *and* in `lib/unsplash.ts`. The copy in
    // this file had no callers. A duplicate export name is how that happens, so
    // assert the name is absent from this module.
    const { readFileSync } = require("node:fs") as typeof import("node:fs");
    const { dirname, join } = require("node:path") as typeof import("node:path");
    const { fileURLToPath } = require("node:url") as typeof import("node:url");

    const source = readFileSync(
      join(dirname(fileURLToPath(import.meta.url)), "../../lib/GridUtilities.ts"),
      "utf8",
    );
    expect(source).not.toMatch(/^export .*\bgroupPhotosByYear\b/m);
  });
});
