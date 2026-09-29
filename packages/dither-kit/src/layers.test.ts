import { createElement, type ReactNode } from "react"
import { describe, expect, it } from "vitest"
import { partitionByLayer } from "./layers"

// Parts declare their layer with a *static* `chartLayer` property rather than a
// prop, so a part behaves identically under the cartesian and polar roots.
const Back = Object.assign(() => null, { chartLayer: "back" as const })
const Dom = Object.assign(() => null, { chartLayer: "dom" as const })
const Plain = () => null

const part = (node: ReactNode) => partitionByLayer([node])

describe("partitionByLayer", () => {
  it("routes a part declaring chartLayer=back behind the dither canvas", () => {
    const { back, svg, dom } = part(createElement(Back))
    expect(back).toHaveLength(1)
    expect(svg).toHaveLength(0)
    expect(dom).toHaveLength(0)
  })

  it("routes a part declaring chartLayer=dom to the DOM sibling stack", () => {
    const { back, svg, dom } = part(createElement(Dom))
    expect(dom).toHaveLength(1)
    expect(back).toHaveLength(0)
    expect(svg).toHaveLength(0)
  })

  it("defaults to the front SVG when no chartLayer is declared", () => {
    const { back, svg, dom } = part(createElement(Plain))
    expect(svg).toHaveLength(1)
    expect(back).toHaveLength(0)
    expect(dom).toHaveLength(0)
  })

  it("treats host elements as front SVG regardless of any chartLayer", () => {
    // `layerOf` bails to "svg" for string types before ever reading a property.
    const { back, svg, dom } = part(createElement("div"))
    expect(svg).toHaveLength(1)
    expect(back).toHaveLength(0)
    expect(dom).toHaveLength(0)
  })

  it("treats non-element children (null, text) as front SVG", () => {
    const { back, svg, dom } = partitionByLayer([
      null,
      "legend text",
      createElement(Back, { key: "back" }),
    ])
    expect(svg).toHaveLength(2)
    expect(back).toHaveLength(1)
    expect(dom).toHaveLength(0)
  })

  it("keeps relative order within each layer", () => {
    const { back, svg, dom } = partitionByLayer([
      createElement(Plain, { key: "a" }),
      createElement(Dom, { key: "b" }),
      createElement(Back, { key: "c" }),
      createElement(Dom, { key: "d" }),
    ])
    expect(back.map((n) => (n as { key: string }).key)).toEqual(["c"])
    expect(svg.map((n) => (n as { key: string }).key)).toEqual(["a"])
    expect(dom.map((n) => (n as { key: string }).key)).toEqual(["b", "d"])
  })

  it("returns three empty layers for no children", () => {
    const { back, svg, dom } = partitionByLayer([])
    expect(back).toEqual([])
    expect(svg).toEqual([])
    expect(dom).toEqual([])
  })
})
