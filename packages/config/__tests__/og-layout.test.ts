import { describe, expect, it } from "vitest"
import {
  computeCardLayout,
  OG_HEIGHT,
  OG_WIDTH,
  type CardInput,
} from "../src/og-card"

/**
 * `computeCardLayout` is the geometry half of `cardToSvg`, extracted so the
 * layout is assertable as numbers rather than by regexing an SVG string.
 *
 * The properties pinned here are the ones the committed OG cards depend on:
 * nothing overflows the panel, nothing collides with the footer, and the
 * bottom-up stacking is respected. The SVG's *appearance* is still covered by
 * `og.test.ts`; what is new is being able to state "a four-line title still
 * fits" as arithmetic.
 */

const base: CardInput = { title: "Claws" }
const layout = (over: Partial<CardInput> = {}, panelWidth?: number) =>
  computeCardLayout({ ...base, ...over }, panelWidth)

describe("computeCardLayout", () => {
  it("anchors the footer to the bottom edge, inset by the padding", () => {
    const l = layout()
    expect(l.pad).toBe(OG_WIDTH * 0.055)
    expect(l.footY).toBe(OG_HEIGHT - l.pad)
  })

  it("keeps the text column inside the type panel", () => {
    // The whole point of the panel: the dither may fill the frame, but text
    // must never sit on top of it.
    for (const panelWidth of [0.4, 0.62, 0.9]) {
      const l = layout({ title: "x".repeat(80) }, panelWidth)
      expect(l.panelW).toBe(OG_WIDTH * panelWidth)
      expect(l.textX).toBeGreaterThanOrEqual(0)
      expect(l.textX).toBeLessThan(l.panelW)
    }
  })

  it("never lets the title grow past the panel, however long it is", () => {
    // `fitText` shrinks until the widest line fits, so this is the property
    // that keeps a 120-character title on the paper panel.
    for (const length of [1, 10, 40, 80, 120, 400]) {
      const l = layout({ title: "word ".repeat(length).trim() })
      const maxLine = Math.max(
        ...l.titleLines.map((line) => line.length),
        0,
      )
      // 0.52 is the conservative per-character ratio the measurer uses, so
      // character count is an upper bound on width in this assertion.
      expect(maxLine * 0.52 * l.titleSize).toBeLessThanOrEqual(l.panelW)
    }
  })

  it("caps the title at four lines", () => {
    const l = layout({ title: "word ".repeat(300).trim() })
    expect(l.titleLines.length).toBeLessThanOrEqual(4)
  })

  it("lifts a single-line title and leaves a multi-line one alone", () => {
    // The "short title lift" of 34px is the whole visual character of a
    // poster card, so it is worth pinning exactly.
    const short = layout({ title: "Claws" })
    const long = layout({ title: "A title long enough that it must wrap" })
    expect(short.singleLine).toBe(true)
    expect(long.singleLine).toBe(false)
    expect(short.titleY).toBeLessThan(long.titleY)
    // Same meta baseline formula, but the single-line lift is added first.
    expect(short.metaY).toBe(OG_HEIGHT - short.pad - 28 - 34)
    expect(long.metaY).toBe(OG_HEIGHT - long.pad - 28)
  })

  it("scales a single-line title up, capped at 1.6x the base size", () => {
    // A one-word title expands to fill the panel; the cap stops a mid-length
    // title ballooning.
    expect(layout({ title: "Claws" }).titleSize).toBeGreaterThan(70)
    const mid = layout({ title: "A reasonably long single line title here" })
    expect(mid.titleSize).toBeLessThanOrEqual(Math.round(70 * 1.6))
  })

  it("stacks upward from the footer, never below it", () => {
    for (const title of [
      "A",
      "A longer title that wraps over lines",
      "word ".repeat(200).trim(),
    ]) {
      for (const description of [
        undefined,
        "A description. ".repeat(30),
      ]) {
        const l = layout({ title, description })

        // The title block's bottom edge is anchored to the meta line by
        // construction — the layout subtracts the block from `metaY` — so the
        // invariant is `<=`, not `<`. What matters is that it never crosses.
        const titleBottom = l.titleY + l.titleLines.length * l.titleSize * 1.06
        expect(titleBottom).toBeLessThanOrEqual(l.metaY)

        if (l.descLines.length) {
          // The description sits between the title and the meta line: its top
          // starts below the title's bottom, its bottom at or above the meta.
          expect(l.descY).toBeGreaterThanOrEqual(titleBottom)
          const descBottom = l.descY + l.descLines.length * l.descSize * 1.42
          expect(descBottom).toBeLessThanOrEqual(l.metaY)
        }

        // And the whole block stays on the canvas.
        expect(l.titleY).toBeGreaterThan(0)
      }
    }
  })

  it("reserves a meta band only when there is meta", () => {
    expect(layout({ meta: "Sep 26, 2026 · 5 min read" }).metaH).toBe(26)
    expect(layout().metaH).toBe(0)
  })

  it("places the accent rule above the meta line in both cases", () => {
    const withMeta = layout({ meta: "Sep 26, 2026 · 5 min read" })
    const without = layout()
    expect(withMeta.accentRuleY).toBeLessThan(withMeta.metaY)
    expect(without.accentRuleY).toBeLessThan(without.metaY)
    // 34 when there is a meta band to clear, 26 when there is not.
    expect(withMeta.metaY - withMeta.accentRuleY).toBe(34)
    expect(without.metaY - without.accentRuleY).toBe(26)
  })

  it("truncates an over-long title and description rather than overflowing", () => {
    const l = layout({ title: "T".repeat(500), description: "D".repeat(900) })
    // `clamp` truncates to 120/200 and appends an ellipsis, then `fitText`
    // *wraps* what is left. So the bound is the clamp plus at most one
    // ellipsis, summed across the lines rather than across a joined string —
    // joining would add a separator per line break and overstate the content.
    const chars = (lines: string[]) =>
      lines.reduce((n, line) => n + line.length, 0);
    expect(chars(l.titleLines)).toBeLessThanOrEqual(121);
    expect(chars(l.descLines)).toBeLessThanOrEqual(201);
    // And the ellipsis is genuinely there, rather than a hard cut.
    expect(l.titleLines.join(" ")).toContain("…");
  })

  it("returns no description lines when there is no description", () => {
    expect(layout().descLines).toEqual([])
    expect(layout({ description: "" }).descLines).toEqual([])
    expect(layout({ description: "something" }).descLines.length).toBeGreaterThan(0)
  })

  it("caps the description at three lines", () => {
    const l = layout({ title: "T", description: "word ".repeat(300).trim() })
    expect(l.descLines.length).toBeLessThanOrEqual(3)
  })

  it("is a pure function of its inputs", () => {
    // Determinism is what lets the generated PNGs be committed at all.
    const a = layout({ title: "Determinism", description: "Yes", meta: "M" })
    const b = layout({ title: "Determinism", description: "Yes", meta: "M" })
    expect(a).toEqual(b)
  })
})
