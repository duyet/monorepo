---
name: verify-kb
description: Drive and prove kb.duyet.net graph motion — labels and connection lines stay readable while zooming, no hide-on-move, fewer Sigma reducer binds and React hover re-renders. Use when verifying apps/kb homepage graph/canvas zoom or layout thrash.
---

# Verify kb graph motion (apps/kb)

Agent-facing skill for the static knowledge base at `apps/kb` (live: `https://kb.duyet.net`). The homepage is a client WebGL graph (Sigma.js). Content lives in the `apps/kb/kb` submodule; do not bump that pointer in a motion/perf PR.

Harness binary (the lever): `.cursor/skills/verify-kb/bin/verify-kb`. Always invoke it by that path from the repo root. It prints JSON. Evidence survives cleanup under `$VERIFY_KB_EVIDENCE` (default `/tmp/verify-kb/<run-id>/`).

Feature map: [`features/README.md`](features/README.md). Drive the mapped feature you are claiming, not a convenient substitute.

## Launch

From the monorepo root, with pnpm 10 and workspace `node_modules` installed. Submodule populated (`git submodule update --init apps/kb/kb`).

```bash
pnpm --filter kb test
```

Ready when the command exits 0. That covers the motion contract (`hideLabelsOnMove: false`, `hideEdgesOnMove: false`). The graph itself is client-only; a production Pages build is optional for this feature.

Optional preview (production `dist/client` if present, otherwise `vite dev` on port 3009):

```bash
.cursor/skills/verify-kb/bin/verify-kb preview-start
```

Ready when `preview.url` in the JSON is answering HTTP 200. Teardown with `preview-stop` or `cleanup`.

## Doctor

Read-only. Run first whenever anything looks off:

```bash
.cursor/skills/verify-kb/bin/verify-kb doctor
```

Pass requires:

- `SIGMA_CAMERA_MOTION.hideLabelsOnMove` is `false` and `hideEdgesOnMove` is `false`.
- `GraphViewer.tsx` does not contain `hideLabelsOnMove: true` or `hideEdgesOnMove: true` / `data-hide-edges-on-move="true"`.
- `GraphViewer.tsx` does not call `setHover` (hover is a ref + text node).
- `apps/kb/kb` is a git submodule (pointer churn is out of scope).

Do not drive an instance whose doctor reports `labelsStayOnMove: false` or `edgesStayOnMove: false`.

## Drive

Prefer the lever over ad-hoc grep. Recipes live in `features/`. Stable handles:

- Homepage graph canvas: `[data-kb-graph="2d"]` / `aria-label="Knowledge graph"`.
- Runtime probe: `window.__kbGraph` (`hideLabelsOnMove`, `hideEdgesOnMove`, `labelCanvasOpaquePixels`, `edgeCanvasOpaquePixels`, `reducerResetCount`, `animateZoom`).
- Dataset: `data-hide-labels-on-move="false"`, `data-hide-edges-on-move="false"`, `data-sigma-ready="true"` after Sigma mounts.

```bash
.cursor/skills/verify-kb/bin/verify-kb prove --feature zoom-edges
```

That is the proven-drive command: doctor, unit tests, preview, Chrome CDP zoom with label and edge pixels sampled mid-animation, JSON + screenshots. For Chrome-only after preview is up:

```bash
.cursor/skills/verify-kb/bin/verify-kb drive zoom-edges
```

`zoom-labels` uses the same driver and the same fail-if-edges-disappear checks.

## Evidence

Named location: `/tmp/verify-kb/<run-id>/` (printed as `evidenceDir` in every command's JSON). Capture:

- `report.json` — lever output (exit, probe, pixel counts, layout metrics).
- `rest.png` / `zoom-mid.png` / `zoom-end.png` — graph canvas at rest, during zoom animation, after zoom.
- `zoom.webm` when ffmpeg can encode screencast frames.
- Screenshots of the homepage graph, not only the site header.

Proof standards:

- Exercise the live canvas (`__kbGraph` + screenshots), not only the TypeScript source.
- Mid-zoom `labelCanvasOpaquePixels` must be > 0 and `hideLabelsOnMove` must be false.
- Every `cameraMoving` sample must have `edgeCanvasOpaquePixels` > 0 and `hideEdgesOnMove` must be false. A moving sample with zero edge ink fails prove.
- `reducerResetCount` must stay `1` after hover-less zoom (reducers bound once per mount).
- Cleanup must not delete this directory.

## Cleanup

```bash
.cursor/skills/verify-kb/bin/verify-kb cleanup
```

Stops only the preview PID this lever started (recorded in `/tmp/verify-kb/state.json`). Never `pkill vite` / `pkill node`. Never delete `evidenceDir`.

## Proven drive

2026-09-03 — `.cursor/skills/verify-kb/bin/verify-kb prove --feature zoom-edges`

Verdict: **VERIFIED**. Homepage Sigma probe: `hideLabelsOnMove: false`, `hideEdgesOnMove: false`, `reducerResetCount: 1` through zoom. Label overlay ink at rest (1680) and while `cameraMoving` (5510–5740). Edge canvas ink at rest (6942) and while `cameraMoving` (20848–22786, min 20848). `layoutCountDelta: 0`. Screenshots `rest.png` / `zoom-mid.png` / `zoom-end.png` plus `zoom.webm`. Evidence: `/tmp/verify-kb/20260903T083111Z/`.

```bash
pnpm --filter kb test
pnpm --filter kb check-types
.cursor/skills/verify-kb/bin/verify-kb prove --feature zoom-edges
```

```bash
.cursor/skills/verify-kb/bin/verify-kb doctor
.cursor/skills/verify-kb/bin/verify-kb test
.cursor/skills/verify-kb/bin/verify-kb drive zoom-edges
.cursor/skills/verify-kb/bin/verify-kb prove --feature zoom-edges
.cursor/skills/verify-kb/bin/verify-kb preview-start
.cursor/skills/verify-kb/bin/verify-kb preview-stop
.cursor/skills/verify-kb/bin/verify-kb cleanup
```

`--help` or an empty invocation prints the same list instead of JSON. All other commands emit one JSON object on stdout. Non-zero exit means the claim is not verified.
