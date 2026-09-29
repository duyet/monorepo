import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, test } from "vitest";
import { formatPeriod } from "../components/experience";
import { cvData } from "../config/cv.data";

/**
 * `cv.data.tsx` writes job dates as `new Date("2023-10")`. ECMAScript parses a
 * bare `YYYY-MM` as **UTC**, so those are `2023-10-01T00:00:00Z`. Formatting
 * them in the viewer's local zone shifted any date landing in the first hours of
 * the local day — which is every one of them, for anyone west of UTC. All seven
 * dates on the CV read a month early for North and South American visitors.
 *
 * **Why this test spawns a subprocess instead of setting `process.env.TZ`.**
 * Node resolves and caches the process timezone on first use, so assigning
 * `process.env.TZ` inside a running process has no effect — verified directly:
 * `process.env.TZ = "America/New_York"` still formatted the date as `Oct`.
 * An in-process "timezone" test is therefore vacuous: it runs in UTC under every
 * label, and it passes against the buggy code. The zone has to be set before the
 * process starts, so each case is a real `TZ=… node …` invocation.
 *
 * (The lane that found this bug wrote the in-process version first. It passed,
 * and it also passed against the original code — which is what prompted the
 * subprocess rewrite.)
 */

const APP_DIR = join(dirname(fileURLToPath(import.meta.url)), "..");

/** Run `formatPeriod` in a fresh Node process with `TZ` set at launch. */
function formatInZone(tz: string, iso: string, toIso?: string): string {
  const dir = mkdtempSync(join(tmpdir(), "cv-tz-"));
  const file = join(dir, "probe.ts");
  try {
    writeFileSync(
      file,
      [
        `import { formatPeriod } from ${JSON.stringify(join(APP_DIR, "components/experience.tsx"))};`,
        `console.log(formatPeriod(new Date(${JSON.stringify(iso)})${
          toIso ? `, new Date(${JSON.stringify(toIso)}))` : ")"
        });`,
      ].join("\n"),
    );
    return execFileSync("pnpm", ["exec", "tsx", file], {
      cwd: APP_DIR,
      encoding: "utf8",
      env: { ...process.env, TZ: tz },
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/** Every experience entry, as the `{from, to}` pair the component receives. */
const entries = cvData.experience.map((e) => ({
  id: e.id,
  from: e.from,
  to: e.to,
}));

const ZONES = [
  "UTC",
  "Asia/Saigon", // the author's own zone
  "Europe/London",
  "America/New_York",
  "America/Los_Angeles",
  "America/Sao_Paulo",
  "Pacific/Auckland",
] as const;

describe("formatPeriod, in the zone it is actually viewed from", () => {
  test("every zone renders the same calendar month", () => {
    // One representative date per shape: a `from` with no `to`, and one with
    // both ends, because the two branches are formatted separately.
    for (const job of [
      { id: "cartrack", iso: "2023-10-01T00:00:00.000Z", toIso: undefined },
      { id: "fossil", iso: "2018-10-01T00:00:00.000Z", toIso: "2023-07-01T00:00:00.000Z" },
    ]) {
      const rendered = ZONES.map((tz) => formatInZone(tz, job.iso, job.toIso));
      const expected = rendered[0];

      expect(new Set(rendered).size, `${job.id} rendered as ${rendered.join(" / ")}`).toBe(1);
      // Guard against the vacuous case where every zone agrees *because the
      // zone was never applied*: assert the expected text explicitly too.
      expect(expected).toBe(
        job.toIso ? "Oct 2018 – Jul 2023" : "Oct 2023 – Present",
      );
    }
  }, 60_000);

  test("the timezone really does reach the formatter", () => {
    // If `TZ` were ignored, the three cases below would all be "Oct 2023" and
    // the test above would pass for the wrong reason. A local-time formatter
    // genuinely differs in the Americas, so this is the control that keeps the
    // real assertion honest.
    const october = "2023-10-01T00:00:00.000Z";

    expect(formatInZone("UTC", october)).toBe("Oct 2023 – Present");
    expect(formatInZone("Asia/Saigon", october)).toBe("Oct 2023 – Present");
    // West of UTC, an unpinned local formatter would say "Sep 2023".
    expect(formatInZone("America/New_York", october)).toBe("Oct 2023 – Present");
    expect(formatInZone("America/Los_Angeles", october)).toBe("Oct 2023 – Present");
  }, 60_000);
});

describe("formatPeriod in this process", () => {
  test("covers every job on the CV, with a well-formed period and the right start year", () => {
    expect(entries.length).toBeGreaterThan(0);

    for (const job of entries) {
      const text = formatPeriod(job.from, job.to);

      expect(text, job.id).toMatch(
        /^[A-Z][a-z]{2} \d{4} – (Present|[A-Z][a-z]{2} \d{4})$/,
      );
      // The start year must be the UTC year of the start date, not the local
      // one — a `new Date("2023-01")` is still 2022 in the Americas.
      expect(text, job.id).toContain(String(job.from.getUTCFullYear()));
    }
  });

  test("an absent end date renders as Present", () => {
    expect(formatPeriod(new Date("2023-10-01T00:00:00Z"))).toBe(
      "Oct 2023 – Present",
    );
  });

  test("the first of the month is not pulled back into the previous month", () => {
    // The specific regression: `new Date("2023-10")` is 2023-10-01T00:00Z, which
    // is 2023-09-30 in the Americas. This is the whole bug in one assertion.
    expect(formatPeriod(new Date("2023-10-01T00:00:00Z")).startsWith("Oct")).toBe(
      true,
    );
    expect(formatPeriod(new Date("2023-01-01T00:00:00Z")).startsWith("Jan")).toBe(
      true,
    );
  });
});
