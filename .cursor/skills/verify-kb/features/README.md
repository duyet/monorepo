# KB graph verification map

This directory is the maintained source for verifying user-facing graph motion of `apps/kb` (`https://kb.duyet.net`). Read the index before driving the app, then use the matching feature file as the recipe.

## Baseline preconditions

- Work from the monorepo root with pnpm 10.
- `apps/kb/kb` submodule is checked out. Do not commit a new submodule pointer for this feature.
- Launch means the homepage graph canvas is answering (dev or preview). `pnpm --filter kb test` is required for the motion contract; a full Pages prerender is not.
- Put `.cursor/skills/verify-kb/bin` on `PATH` or invoke the binary by repo-relative path.
- Run `verify-kb doctor` and require `labelsStayOnMove: true` and `edgesStayOnMove: true`.
- Never drive a preview that this run did not start, unless `--url` is passed explicitly.

## Driving conventions

- Wait for `data-sigma-ready="true"` and `window.__kbGraph` before zooming. The staged reveal hides labels for ~1.4s on first load — wait until that finishes.
- Zoom through `__kbGraph.animateZoom`, not a CSS transform of the page.
- Cleanup stops only the preview PID in `/tmp/verify-kb/state.json`. Do not remove proof artifacts.

## Proof and skip reporting

- Capture the user action (zoom) and the resulting state (labels still inked on the 2D overlay; edges still inked on `canvas.sigma-edges`).
- Pixel proof is `labelCanvasOpaquePixels` and `edgeCanvasOpaquePixels` at rest, mid-zoom, and while `cameraMoving`. Source grep alone is not enough for a zoom-labels or zoom-edges claim. A `cameraMoving` sample with `edgePixels === 0` fails prove.
- Record LayoutCount / RecalcStyleCount deltas when Chrome Performance metrics are available. Do not claim "no jank" without a number.
- Report an unreachable path with the attempted command and the unmet precondition.

## Feature entry contract

Each feature file starts with an H1 title and one paragraph describing the user-visible behavior. It then uses exactly four H2 sections in this order.

1. `Sub-features` lists short IDs with one line for each behavior.
2. `How to get to it (user POV)` lists every user entry point.
3. `Driving it with verify-kb` starts with `Preconditions:` and uses labeled bullets that pair each user action with an exact command and observable result.
4. `Gotchas` lists traps that can waste or invalidate a verification run.

## Features

- [Zoom labels](./zoom-labels.md) covers homepage graph zoom keeping labels readable, with cheaper hover/refresh. Edges stay inked too.
- [Zoom edges](./zoom-edges.md) covers homepage graph zoom/pan keeping connection lines inked (`hideEdgesOnMove: false`). Labels stay; do not re-enable `hideLabelsOnMove`.
