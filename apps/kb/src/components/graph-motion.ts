/**
 * Camera / label motion contract for kb graph canvases (Sigma.js).
 *
 * Labels are a 2D overlay, not measured DOM. `hideLabelsOnMove` was a FPS
 * shortcut that blanked every label for the whole pan/zoom/animate. Edges
 * are the expensive stroke and can still be skipped while the camera moves.
 * Reducers read refs and are assigned once so hover does not rebuild Sigma's
 * index or re-render React.
 */

export const SIGMA_CAMERA_MOTION = {
  renderLabels: true,
  /** Keep node labels readable while the camera pans, zooms, or animates. */
  hideLabelsOnMove: false,
  /** Skip edge strokes during camera moves — cheaper than dropping labels. */
  hideEdgesOnMove: true,
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
  hideEdgesOnMove: true,
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
    if (win.__kbGraph === probe) delete win.__kbGraph;
    delete container.dataset.sigmaReady;
  };
}
