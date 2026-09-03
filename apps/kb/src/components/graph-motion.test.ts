import { describe, expect, it } from "vitest";
import {
  GRAPH_MOTION_CONTRACT,
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

  it("still skips edges during pan/zoom so the camera stays cheap", () => {
    expect(SIGMA_CAMERA_MOTION.hideEdgesOnMove).toBe(true);
    expect(SIGMA_HOMEPAGE_RENDER.hideEdgesOnMove).toBe(true);
    expect(GRAPH_MOTION_CONTRACT.hideEdgesOnMove).toBe(true);
  });

  it("does not re-render React or rebind Sigma reducers on hover", () => {
    expect(GRAPH_MOTION_CONTRACT.hoverUsesReactState).toBe(false);
    expect(GRAPH_MOTION_CONTRACT.reducersAssignedOnce).toBe(true);
    expect(GRAPH_MOTION_CONTRACT.graph3dRemountsOnHighlight).toBe(false);
  });
});
