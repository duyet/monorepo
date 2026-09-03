# Zoom keeps graph connection lines inked

On the kb homepage graph, connection lines stay on the edges WebGL canvas while the user zooms or pans. Motion must not blank edges. Labels stay on too — do not re-enable `hideLabelsOnMove`.

## Sub-features

- `edges-on-move` keeps `hideEdgesOnMove` false so Sigma does not skip the edges layer during pan/zoom/animate.
- `labels-on-move` keeps `hideLabelsOnMove` false (labels stay; do not trade them for edges).
- `pixels-mid-zoom-edges` has opaque pixels on `canvas.sigma-edges` while `cameraMoving` is true.
- `hover-no-rerender` updates the hover hint through a ref, not `setHover`.
- `reducers-once` binds node/edge reducers once per mount (`reducerResetCount === 1`).

## How to get to it (user POV)

- Open `https://kb.duyet.net/` and scroll-zoom or pan the graph.
- Open the same homepage on a Pages preview hostname after a green kb build.
- After `verify-kb preview-start`, open `http://127.0.0.1:3009/` (dev) or the printed preview URL.

## Driving it with verify-kb

Preconditions:

- `verify-kb doctor` reports `edgesStayOnMove: true` and `labelsStayOnMove: true`.
- A preview this run started is answering, or `--url` points at a running kb homepage.
- Headless Chrome can create a WebGL context (swiftshader flags in the drive script).

- **Contract.** Run `.cursor/skills/verify-kb/bin/verify-kb prove --feature zoom-edges`. Combined JSON `"ok": true`.
- **Canvas.** After Sigma ready, rest `edgeCanvasOpaquePixels` > 0 and `labelCanvasOpaquePixels` > 0. Call `__kbGraph.animateZoom(0.5, 800)`. Every sample with `cameraMoving` has `edgePixels` > 0. `hideEdgesOnMove` and `hideLabelsOnMove` are false. `reducerResetCount` is 1.
- **Artifact.** `evidenceDir/rest.png`, `zoom-mid.png`, `zoom-end.png`, `report.json`. Optional `zoom.webm`.

## Gotchas

- Live `kb.duyet.net` still hides edges until this change is deployed. Recert local preview (or a new Pages preview), not stale production, for the fix claim. Production is the before-state.
- Sigma draws edges on a dedicated WebGL canvas (`canvas.sigma-edges`). Sampling the 2D label overlay cannot prove edges stayed.
- `hideEdgesOnMove: true` clears that layer every frame while the camera is animated. Source grep of the setting is not enough; mid-zoom `edgeCanvasOpaquePixels` must stay above zero.
- The first 1.4s staged reveal hides some nodes. Wait until rest edge ink exists before zooming.
- Do not bump `apps/kb/kb` or mix leftover PRs #1362 / #1365 / #1422.
