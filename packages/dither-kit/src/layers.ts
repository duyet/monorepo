import { Children, isValidElement, type ReactNode } from "react"

/** Which render layer a composed part targets — defaults to the front SVG. */
export type ChartLayer = "back" | "dom" | "svg"

function layerOf(node: ReactNode): ChartLayer {
  if (!isValidElement(node) || typeof node.type === "string") return "svg"
  return (node.type as { chartLayer?: "back" | "dom" }).chartLayer ?? "svg"
}

/**
 * Sort composed children into the three layers every chart root stacks:
 * behind the dither canvas (`back` chrome), on the front SVG, or as DOM
 * siblings (`dom` — legend / tooltip). Parts declare their layer with a
 * static `chartLayer` property, so a part behaves identically under both the
 * cartesian and the polar root.
 */
export function partitionByLayer(children: ReactNode) {
  const back: ReactNode[] = []
  const svg: ReactNode[] = []
  const dom: ReactNode[] = []
  Children.forEach(children, (child) => {
    const layer = layerOf(child)
    if (layer === "back") back.push(child)
    else if (layer === "dom") dom.push(child)
    else svg.push(child)
  })
  return { back, svg, dom }
}
