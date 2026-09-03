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
