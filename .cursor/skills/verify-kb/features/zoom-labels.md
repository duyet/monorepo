# Zoom keeps graph labels readable

On the kb homepage graph, node labels stay on the canvas while the user zooms. Motion should not blank labels or rebuild Sigma reducers / re-render React on hover.

## Sub-features

- `labels-on-move` keeps `hideLabelsOnMove` false so Sigma does not skip the label overlay during pan/zoom/animate.
- `edges-on-move` still skips edges while the camera moves (`hideEdgesOnMove: true`).
- `hover-no-rerender` updates the hover hint through a ref, not `setHover`.
- `reducers-once` binds node/edge reducers once per mount (`reducerResetCount === 1`).
- `pixels-mid-zoom` has opaque label-canvas pixels while a zoom animation is in flight.

## How to get to it (user POV)

- Open `https://kb.duyet.net/` and scroll-zoom the graph.
- Open the same homepage on a Pages preview hostname after a green kb build.
- After `verify-kb preview-start`, open `http://127.0.0.1:3009/` (dev) or the printed preview URL.

## Driving it with verify-kb

Preconditions:

- `verify-kb doctor` reports `labelsStayOnMove: true`.
- A preview this run started is answering, or `--url` points at a running kb homepage.
- Headless Chrome can create a WebGL context (swiftshader flags in the drive script).

- **Contract.** Run `.cursor/skills/verify-kb/bin/verify-kb prove --feature zoom-labels`. Combined JSON `"ok": true`.
- **Canvas.** After Sigma ready, rest `labelCanvasOpaquePixels` > 0. Call `__kbGraph.animateZoom(0.5, 800)`. Mid-animation pixels > 0 and `hideLabelsOnMove` is false. `reducerResetCount` is 1.
- **Artifact.** `evidenceDir/rest.png`, `zoom-mid.png`, `zoom-end.png`, `report.json`. Optional `zoom.webm`.

## Gotchas

- Live `kb.duyet.net` still hides labels until this change is deployed. Recert local preview (or a new Pages preview), not stale production, for the fix claim. Production is the before-state.
- The first 1.4s staged reveal clears labels on purpose. Sampling before reveal finishes looks like a zoom-label failure.
- WebGL-less Chrome yields no Sigma probe. That is an environment miss, not proof that labels hide.
- Do not bump `apps/kb/kb` or mix leftover PRs #1362 / #1365 / #1422.
