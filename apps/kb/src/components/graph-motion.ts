/**
 * Camera / label / edge motion contract for kb graph canvases (Sigma.js).
 *
 * Labels are a 2D overlay, not measured DOM. `hideLabelsOnMove` was a FPS
 * shortcut that blanked every label for the whole pan/zoom/animate.
 * `hideEdgesOnMove` skipped the dedicated edges WebGL layer the same way —
 * connection lines vanished and the graph felt leaky. Keep both inked while
 * the camera moves. Reducers read refs and are assigned once so hover does
 * not rebuild Sigma's index or re-render React.
 */

export const SIGMA_CAMERA_MOTION = {
  renderLabels: true,
  /** Keep node labels readable while the camera pans, zooms, or animates. */
  hideLabelsOnMove: false,
  /** Keep connection lines inked while the camera pans, zooms, or animates. */
  hideEdgesOnMove: false,
} as const;

export const SIGMA_HOMEPAGE_RENDER = {
  ...SIGMA_CAMERA_MOTION,
  allowInvalidContainer: true,
  renderEdgeLabels: false,
  defaultEdgeType: "arrow" as const,
  labelFont: "ui-sans-serif, system-ui, sans-serif",
  labelSize: 11,
  labelWeight: "500",
  labelDensity: 0.12,
  labelGridCellSize: 80,
  labelRenderedSizeThreshold: 8,
  stagePadding: 40,
  minCameraRatio: 0.08,
  maxCameraRatio: 12,
  zIndex: true,
};

export const GRAPH_MOTION_CONTRACT = {
  hideLabelsOnMove: false,
  hideEdgesOnMove: false,
  hoverUsesReactState: false,
  reducersAssignedOnce: true,
  graph3dRemountsOnHighlight: false,
} as const;

// ── Mount choreography ──────────────────────────────────────────────────────
//
// Every number and easing curve that decides how the graph *arrives*. These
// used to be inline in the Sigma mount effect, where a typo in a coefficient is
// invisible to a type check and only shows up as "the graph feels subtly off".
// They are the one part of the mount that is worth asserting on, so they live
// here as plain functions and are covered by `graph-motion.test.ts`.

/** How long the staged node reveal takes, hub-first, before the graph rests. */
export const REVEAL_MS = 1400;

/** The reveal starts this much wider than the settled frame and eases in. */
export const REVEAL_START_STRETCH = 0.3;

/** Click-to-read only ever zooms in, never out past the current frame. */
export const CLICK_FOCUS_RATIO = 0.55;
export const CLICK_FOCUS_MS = 280;

/** Search / panel focus flies further in than a click does. */
export const FOCUS_FLY_RATIO = 0.45;
export const FOCUS_FLY_MS = 320;

/** "reset camera" is a short animated return to the fitted frame. */
export const CAMERA_RESET_MS = 300;

/**
 * Ease-out cubic on a 0..1 linear clock — fast start, long settle, so the
 * reveal decelerates into a still frame instead of stopping dead.
 */
export function revealEase(linear: number): number {
  return 1 - (1 - linear) ** 3;
}

/**
 * Camera ratio for one frame of the reveal: the settled frame scaled out by
 * `REVEAL_START_STRETCH` at `eased = 0`, and exactly the settled frame at 1.
 */
export function revealRatio(finalRatio: number, eased: number): number {
  return finalRatio * (1 + REVEAL_START_STRETCH - REVEAL_START_STRETCH * eased);
}

/**
 * Where the camera goes when a node is clicked, in *camera* space — the live
 * layout rescales graph coordinates, so the node's own attributes are not where
 * it appears on screen.
 */
export function clickFocusTarget(
  display: { x: number; y: number },
  ratio: number
): { x: number; y: number; ratio: number } {
  return {
    x: display.x,
    y: display.y,
    ratio: Math.min(ratio, CLICK_FOCUS_RATIO),
  };
}

/** Where the camera goes when a node is focused from search or the read panel. */
export function focusFlyTarget(display: { x: number; y: number }): {
  x: number;
  y: number;
  ratio: number;
} {
  return { x: display.x, y: display.y, ratio: FOCUS_FLY_RATIO };
}

export type KbGraphProbe = {
  hideLabelsOnMove: boolean;
  hideEdgesOnMove: boolean;
  renderLabels: boolean;
  cameraMoving: boolean;
  labelCanvasOpaquePixels: number;
  edgeCanvasOpaquePixels: number;
  refreshCount: number;
  reducerResetCount: number;
  zoomBy: (factor: number) => void;
  animateZoom: (factor: number, durationMs: number) => void;
};

type SigmaCamera = {
  getState: () => { x: number; y: number; ratio: number };
  setState: (state: { x?: number; y?: number; ratio?: number }) => void;
  animate: (
    state: { x?: number; y?: number; ratio?: number },
    opts?: { duration?: number }
  ) => void;
  animated?: boolean;
  isAnimated?: () => boolean;
};

export type SigmaProbeHost = {
  getSetting: (
    key: "hideLabelsOnMove" | "hideEdgesOnMove" | "renderLabels"
  ) => unknown;
  getCamera: () => SigmaCamera;
  getCanvases: () => Record<string, HTMLCanvasElement>;
  on: (event: "afterRender", handler: () => void) => void;
  off: (event: "afterRender", handler: () => void) => void;
};

export function countLabelCanvasOpaquePixels(container: HTMLElement): number {
  const canvases = container.querySelectorAll("canvas");
  let best = 0;
  for (const canvas of canvases) {
    if (!(canvas instanceof HTMLCanvasElement)) continue;
    if (canvas.width < 2 || canvas.height < 2) continue;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d", { willReadFrequently: true });
    } catch {
      ctx = null;
    }
    if (!ctx) continue;
    const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let n = 0;
    // Stride by 4 pixels to keep the probe cheap on a full-viewport canvas.
    for (let i = 3; i < data.length; i += 16) {
      if (data[i] > 24) n += 1;
    }
    if (n > best) best = n;
  }
  return best;
}

function webglContext(canvas: HTMLCanvasElement): WebGLRenderingContext | null {
  for (const name of ["webgl2", "webgl"] as const) {
    let ctx: RenderingContext | null = null;
    try {
      ctx = canvas.getContext(name);
    } catch {
      ctx = null;
    }
    if (ctx && "readPixels" in ctx) {
      return ctx as WebGLRenderingContext;
    }
  }
  return null;
}

export function countEdgeCanvasOpaquePixels(
  sigma: SigmaProbeHost,
  container: HTMLElement
): number {
  const canvases = sigma.getCanvases?.() ?? {};
  const edges =
    canvases.edges ??
    container.querySelector("canvas.sigma-edges") ??
    null;
  if (!(edges instanceof HTMLCanvasElement)) return 0;
  const gl = webglContext(edges);
  if (!gl) return 0;
  const width = gl.drawingBufferWidth;
  const height = gl.drawingBufferHeight;
  if (width < 2 || height < 2) return 0;
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  const pixels = new Uint8Array(width * height * 4);
  gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let n = 0;
  // Same stride as the label overlay probe.
  for (let i = 3; i < pixels.length; i += 16) {
    if (pixels[i] > 24) n += 1;
  }
  return n;
}

function cameraIsMoving(camera: SigmaCamera): boolean {
  if (typeof camera.isAnimated === "function") return camera.isAnimated();
  if (typeof camera.animated === "boolean") return camera.animated;
  return false;
}

export function attachKbGraphProbe(
  sigma: SigmaProbeHost,
  container: HTMLElement,
  counters: { refreshCount: () => number; reducerResetCount: () => number }
): () => void {
  // Sample the edges WebGL layer in afterRender so readPixels still sees
  // the buffer (Sigma creates it with preserveDrawingBuffer: false).
  let edgeInk = 0;
  const sampleEdges = () => {
    edgeInk = countEdgeCanvasOpaquePixels(sigma, container);
  };
  sigma.on("afterRender", sampleEdges);
  sampleEdges();

  const probe: KbGraphProbe = {
    get hideLabelsOnMove() {
      return sigma.getSetting("hideLabelsOnMove") === true;
    },
    get hideEdgesOnMove() {
      return sigma.getSetting("hideEdgesOnMove") === true;
    },
    get renderLabels() {
      return sigma.getSetting("renderLabels") !== false;
    },
    get cameraMoving() {
      return cameraIsMoving(sigma.getCamera());
    },
    get labelCanvasOpaquePixels() {
      return countLabelCanvasOpaquePixels(container);
    },
    get edgeCanvasOpaquePixels() {
      return edgeInk;
    },
    get refreshCount() {
      return counters.refreshCount();
    },
    get reducerResetCount() {
      return counters.reducerResetCount();
    },
    zoomBy(factor: number) {
      const camera = sigma.getCamera();
      const state = camera.getState();
      camera.setState({ ratio: state.ratio * factor });
    },
    animateZoom(factor: number, durationMs: number) {
      const camera = sigma.getCamera();
      const state = camera.getState();
      camera.animate({ ratio: state.ratio * factor }, { duration: durationMs });
    },
  };

  const win = window as Window & { __kbGraph?: KbGraphProbe };
  win.__kbGraph = probe;
  container.dataset.hideLabelsOnMove = String(probe.hideLabelsOnMove);
  container.dataset.hideEdgesOnMove = String(probe.hideEdgesOnMove);
  container.dataset.sigmaReady = "true";

  return () => {
    sigma.off("afterRender", sampleEdges);
    if (win.__kbGraph === probe) delete win.__kbGraph;
    delete container.dataset.sigmaReady;
  };
}
