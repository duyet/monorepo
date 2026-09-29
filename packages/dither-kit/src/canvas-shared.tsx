"use client"

import type { RefObject } from "react"
import type { Margins } from "./chart-context"
import { type BloomInput, bloomLayerStyle } from "./dither-paint"

/** The plot rect in the root's coordinate space — where every canvas sits. */
export function plotRect(
  margins: Margins,
  plot: { width: number; height: number }
) {
  return {
    left: margins.left,
    top: margins.top,
    width: plot.width,
    height: plot.height,
  } as const
}

/** The input the canvas derives its paint inputs from.
 *
 * A rewritten value under an identical signature would paint the stale pixels
 * forever, so the loop compares this each frame and repaints when it moves.
 */
export type PaintSignatureInput = {
  stackType: string
  configKeys: string[]
  seriesSpecs: Record<string, { variant: string } | undefined>
}

/** Composite signature of every tweak that changes pixels without re-animating
 * (stacking + per-series variant) — compared against the previous frame. */
export function paintSignature({
  stackType,
  configKeys,
  seriesSpecs,
}: PaintSignatureInput): string {
  return `${stackType}|${configKeys
    .map((k) => seriesSpecs[k]?.variant ?? "")
    .join(",")}`
}

/**
 * The crisp dither canvas plus its blurred, additive bloom copy. Every family
 * painter (cartesian / bar / pie / radar) renders exactly this pair over the
 * same plot rect, so the geometry, classes and opacity transition live here
 * instead of being copied into each painter.
 *
 * `active` is "the pointer (or parent) is over the chart" — polar roots have no
 * parent-driven hover, so they pass their own `isMouseInChart` and the
 * `bloomOnHover` rule below still resolves to the same thing.
 */
export function DitherCanvases({
  canvasRef,
  bloomRef,
  bloom,
  bloomOnHover,
  active,
  pos,
}: {
  canvasRef: RefObject<HTMLCanvasElement | null>
  bloomRef: RefObject<HTMLCanvasElement | null>
  bloom: BloomInput
  bloomOnHover: boolean
  active: boolean
  pos: { left: number; top: number; width: number; height: number }
}) {
  const style = bloomLayerStyle(bloom, bloomOnHover ? active : true)
  return (
    <>
      <canvas
        ref={canvasRef}
        className="pointer-events-none absolute"
        style={{ ...pos, imageRendering: "pixelated" }}
      />
      <canvas
        ref={bloomRef}
        className="pointer-events-none absolute"
        style={{
          ...pos,
          transition: "opacity 220ms ease",
          ...(style ?? { opacity: 0 }),
        }}
      />
    </>
  )
}
