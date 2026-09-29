import { describe, expect, it } from "vitest";
import {
  CAMERA_RESET_MS,
  clickFocusTarget,
  CLICK_FOCUS_MS,
  CLICK_FOCUS_RATIO,
  focusFlyTarget,
  FOCUS_FLY_MS,
  FOCUS_FLY_RATIO,
  GRAPH_MOTION_CONTRACT,
  REVEAL_MS,
  REVEAL_START_STRETCH,
  revealEase,
  revealRatio,
  SIGMA_CAMERA_MOTION,
  SIGMA_HOMEPAGE_RENDER,
} from "./graph-motion";

describe("kb graph motion contract", () => {
  it("keeps labels on while the camera moves", () => {
    expect(SIGMA_CAMERA_MOTION.hideLabelsOnMove).toBe(false);
    expect(SIGMA_CAMERA_MOTION.renderLabels).toBe(true);
    expect(SIGMA_HOMEPAGE_RENDER.hideLabelsOnMove).toBe(false);
    expect(GRAPH_MOTION_CONTRACT.hideLabelsOnMove).toBe(false);
  });

  it("keeps connection lines on while the camera moves", () => {
    expect(SIGMA_CAMERA_MOTION.hideEdgesOnMove).toBe(false);
    expect(SIGMA_HOMEPAGE_RENDER.hideEdgesOnMove).toBe(false);
    expect(GRAPH_MOTION_CONTRACT.hideEdgesOnMove).toBe(false);
  });

  it("does not re-enable hideLabelsOnMove when keeping edges", () => {
    expect(SIGMA_CAMERA_MOTION.hideLabelsOnMove).toBe(false);
    expect(SIGMA_CAMERA_MOTION.hideEdgesOnMove).toBe(false);
    expect(GRAPH_MOTION_CONTRACT.hideLabelsOnMove).toBe(false);
    expect(GRAPH_MOTION_CONTRACT.hideEdgesOnMove).toBe(false);
  });

  it("does not re-render React or rebind Sigma reducers on hover", () => {
    expect(GRAPH_MOTION_CONTRACT.hoverUsesReactState).toBe(false);
    expect(GRAPH_MOTION_CONTRACT.reducersAssignedOnce).toBe(true);
    expect(GRAPH_MOTION_CONTRACT.graph3dRemountsOnHighlight).toBe(false);
  });
});

// The coefficients below used to be inline in the Sigma mount effect, where a
// typo is invisible to a type check and only reads as "the graph feels subtly
// off". They are the part of the mount worth asserting on.
describe("staged reveal", () => {
  it("pins 0 and 1, so the graph starts and ends on the settled frame", () => {
    expect(revealEase(0)).toBe(0);
    expect(revealEase(1)).toBe(1);
  });

  it("decelerates into the rest — ease-out cubic, never ahead of the clock", () => {
    expect(revealEase(0.5)).toBeCloseTo(0.875);
    for (let t = 0; t <= 1; t += 0.05) {
      expect(revealEase(t)).toBeLessThanOrEqual(1);
      if (t > 0)
        expect(revealEase(t)).toBeGreaterThanOrEqual(revealEase(t - 0.05));
    }
  });

  it("dollies in from a wider frame to exactly the settled ratio", () => {
    const settled = 0.42;
    expect(revealRatio(settled, 0)).toBeCloseTo(settled * 1.3, 12);
    expect(revealRatio(settled, 1)).toBe(settled);
    // Halfway eased, most of the way home — the dolly leads the node fade.
    expect(revealRatio(settled, 0.5)).toBeCloseTo(settled * 1.15, 12);
    expect(REVEAL_START_STRETCH).toBe(0.3);
  });

  it("keeps the reveal a fixed, short burst so the graph rests still", () => {
    expect(REVEAL_MS).toBe(1400);
  });
});

describe("focus camera targets", () => {
  it("zooms in on a click, but never back out past the current frame", () => {
    expect(clickFocusTarget({ x: 3, y: -4 }, 0.9)).toEqual({
      x: 3,
      y: -4,
      ratio: CLICK_FOCUS_RATIO,
    });
    expect(clickFocusTarget({ x: 3, y: -4 }, 0.2).ratio).toBe(0.2);
  });

  it("flies further in from search and the read panel than a click does", () => {
    expect(FOCUS_FLY_RATIO).toBeLessThan(CLICK_FOCUS_RATIO);
    expect(focusFlyTarget({ x: -1, y: 2 })).toEqual({
      x: -1,
      y: 2,
      ratio: FOCUS_FLY_RATIO,
    });
  });

  it("keeps every focus move short enough to feel like a snap", () => {
    expect(CLICK_FOCUS_MS).toBe(280);
    expect(FOCUS_FLY_MS).toBe(320);
    expect(CAMERA_RESET_MS).toBe(300);
  });
});
