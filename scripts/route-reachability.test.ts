import { describe, expect, test } from "vitest";
import { analyzeApp, POSITIVE_CONTROLS } from "./route-reachability";

/**
 * Turns the reachability report into a gate.
 *
 * `route-reachability.ts` *reports* which source files no entry point can reach.
 * That is useful and easy to ignore, which is why the finding it produced — ~6,300
 * dead lines — took four separate passes to act on. This asserts the set does not
 * **grow**: any new unreachable file fails, and cleaning one up lets the recorded
 * list shrink.
 *
 * ## Why a subset check rather than an exact match
 *
 * An exact match would fail on every legitimate cleanup, and the fix would be to
 * update the list — which is the same friction as before with extra ceremony.
 * A subset check only fails when the set gets *worse*, which is the direction
 * worth blocking.
 *
 * ## The blind spot this cannot cover
 *
 * `llm-timeline/test-fixtures.ts` is test-only. The walk follows production
 * source, so a file that exists solely to feed a test looks dead by construction.
 * It is recorded below as a known blind spot rather than worked around, because
 * working around it would need a second graph over test files and the honest
 * answer is that "reachable only from a test" is a different question from
 * "unreachable".
 *
 * ## If this test fails
 *
 * A new file was added that nothing imports. Either it is dead — delete it, and
 * record any of its test files in `KNOWN_UNREACHABLE` with a reason — or it is
 * live and something the walk cannot see is missing. Check the entry points in
 * `ROOT_PATTERNS` in `route-reachability.ts` before assuming the first: a live
 * module loaded by filename convention (as TanStack Start loads `entry-client.tsx`)
 * needs a root entry, not a deletion.
 */
const KNOWN_UNREACHABLE: Record<string, string> = {
  "apps/llm-timeline/test-fixtures.ts":
    "Test-only. Used by filter-info.test.tsx, which tests filter-info.tsx — a " +
    "live module. The walk follows production source, so a fixture looks dead " +
    "by construction. Recorded as a stated blind spot.",
};

/** Apps that have at least one positive control, so the walk is validated. */
const GUARDED_APPS = Object.keys(POSITIVE_CONTROLS);

describe("route reachability guard", () => {
  for (const app of GUARDED_APPS) {
    test(`${app}: no new unreachable source`, () => {
      const report = analyzeApp(app);

      // The controls must hold, or nothing below means anything. `analyzeApp`
      // reports which ones failed rather than throwing.
      expect(
        report.brokenControls,
        `the walk for "${app}" could not find known-reachable modules, so its ` +
          `results are discarded`,
      ).toEqual([]);

      const newlyUnreachable = report.unreachable.filter(
        (file) => !(file in KNOWN_UNREACHABLE)
      );

      expect(
        newlyUnreachable,
        `newly unreachable in apps/${app}. If these are dead, delete them and ` +
          `add any orphaned test file to KNOWN_UNREACHABLE with a reason. If ` +
          `they are live, the walk is missing an entry point — check ` +
          `ROOT_PATTERNS in route-reachability.ts.`,
      ).toEqual([]);
    });
  }

  test("every recorded entry still exists, and still has a reason", () => {
    // Keeps the list honest in the other direction: a file that has since been
    // wired up or deleted should be removed from it, not left to rot as a
    // permanent exemption.
    const stale: string[] = [];

    for (const file of Object.keys(KNOWN_UNREACHABLE)) {
      try {
        const report = analyzeApp(file.split("/")[1]);
        if (!report.unreachable.includes(file)) stale.push(file);
      } catch {
        stale.push(file);
      }
    }

    expect(
      stale,
      "these are recorded as unreachable but are now reachable or gone — remove " +
        "them from KNOWN_UNREACHABLE",
    ).toEqual([]);
  });

  test("each recorded entry carries a non-trivial reason", () => {
    for (const [file, reason] of Object.entries(KNOWN_UNREACHABLE)) {
      expect(reason.length, file).toBeGreaterThan(40);
      expect(reason.trimEnd(), file).toBe(reason);
    }
  });
});
