import { describe, expect, test } from "vitest";
import {
  countEm,
  fitCountPx,
  MAX_COUNT_PX,
  MIN_COUNT_PX,
  PROBE_PX,
} from "./count";

/**
 * The bug these guard: the count is a formatted number whose digit count
 * grows over time, so a viewport-relative size fits today's digits and
 * overflows the screen once one more is added. Its size has to follow the
 * string, not the viewport.
 */

/**
 * Inter's advances at weight 500 with tabular figures, measured in Chrome:
 * 0.648em per digit and 0.2686em per comma, each then tracking at the count's
 * own -0.045em. These are the numbers `countEm` is built from, so a drift
 * here means the stylesheet's typography and the model disagree.
 */
const DIGIT_EM = 0.648;
const COMMA_EM = 0.2686;
const TRACKING_EM = -0.045;

/** Width a formatted string renders at, in px, at the probe size. */
function widthAtProbe(digits: number, commas: number): number {
  return (
    (digits * (DIGIT_EM + TRACKING_EM) + commas * (COMMA_EM + TRACKING_EM)) *
    PROBE_PX
  );
}

describe("countEm", () => {
  test("counts digits and commas at their own widths, tracked alike", () => {
    expect(countEm("0")).toBeCloseTo(DIGIT_EM + TRACKING_EM, 5);
    expect(countEm(",")).toBeCloseTo(COMMA_EM + TRACKING_EM, 5);
    expect(countEm("163,813,446,180")).toBeCloseTo(
      12 * (DIGIT_EM + TRACKING_EM) + 3 * (COMMA_EM + TRACKING_EM),
      5
    );
  });

  test("grows when a digit is added", () => {
    // The overflow itself: today's string has to be wider than yesterday's.
    expect(countEm("1,163,813,446,180")).toBeGreaterThan(
      countEm("163,813,446,180")
    );
  });

  test("an empty string has no width", () => {
    expect(countEm("")).toBe(0);
  });
});

describe("fitCountPx", () => {
  test("scales the measured string onto the available box", () => {
    expect(fitCountPx(360, widthAtProbe(12, 3))).toBe(45);
  });

  test("a wider box buys a bigger count", () => {
    const text = widthAtProbe(12, 3);
    expect(fitCountPx(700, text)).toBeGreaterThan(fitCountPx(350, text));
  });

  test("caps at the desktop ceiling and floors at the legible minimum", () => {
    expect(fitCountPx(10_000, widthAtProbe(4, 1))).toBe(MAX_COUNT_PX);
    expect(fitCountPx(10, widthAtProbe(4, 1))).toBe(MIN_COUNT_PX);
  });

  test("falls back to the minimum when nothing has been measured", () => {
    expect(fitCountPx(360, 0)).toBe(MIN_COUNT_PX);
    expect(fitCountPx(0, widthAtProbe(12, 3))).toBe(MIN_COUNT_PX);
  });

  test("the fitted text fits, at any digit count a real total reaches", () => {
    // 288px is a 320px phone with this page's 16px padding. Up to 15 digits
    // (a quadrillion) the fit is exact rather than clamped.
    for (const [digits, commas] of [
      [4, 1],
      [9, 2],
      [12, 3],
      [15, 4],
    ]) {
      const measured = widthAtProbe(digits, commas);
      const size = fitCountPx(288, measured);
      expect(size).toBeGreaterThan(MIN_COUNT_PX);
      expect(size * measured).toBeLessThanOrEqual(288 * PROBE_PX);
    }
  });

  test("gives up fitting before it gives up legibility", () => {
    // 19 digits is past any real total, and the floor wins there on purpose:
    // an unreadable count is a smaller failure than one off the screen.
    expect(fitCountPx(288, widthAtProbe(19, 6))).toBe(MIN_COUNT_PX);
  });

  test("never rounds past the box it was fitted to", () => {
    // A width landing on a fraction of a pixel floors rather than rounding up,
    // or the count pushes a pixel of horizontal scroll onto the page.
    for (const available of [280, 288, 320.5, 358, 361, 420.25]) {
      const size = fitCountPx(available, widthAtProbe(13, 3));
      expect(size * (widthAtProbe(13, 3) / PROBE_PX)).toBeLessThanOrEqual(
        available
      );
    }
  });
});
