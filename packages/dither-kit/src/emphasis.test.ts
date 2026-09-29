import { describe, expect, it } from "vitest"
import { DIM, dimOf, emphasisOf, isDimmed } from "./emphasis"

describe("emphasisOf", () => {
  it("returns null when nothing is selected and nothing hovered", () => {
    expect(
      emphasisOf({ selectedDataKey: null, focusDataKey: null })
    ).toBeNull()
  })

  it("prefers an explicit selection over a transient legend hover", () => {
    expect(
      emphasisOf({ selectedDataKey: "visits", focusDataKey: "clicks" })
    ).toBe("visits")
  })

  it("falls back to the focus key when nothing is selected", () => {
    expect(
      emphasisOf({ selectedDataKey: null, focusDataKey: "clicks" })
    ).toBe("clicks")
  })
})

describe("isDimmed", () => {
  it("dims nothing when there is no spotlight", () => {
    // The `!== null` guard: a null selection must leave every series lit, even
    // though `null !== key` is technically true for every key.
    expect(isDimmed(null, "visits")).toBe(false)
    expect(isDimmed(null, "clicks")).toBe(false)
  })

  it("leaves the spotlighted series lit and dims the rest", () => {
    expect(isDimmed("visits", "visits")).toBe(false)
    expect(isDimmed("visits", "clicks")).toBe(true)
  })
})

describe("dimOf", () => {
  it("is a no-op multiplier when there is no spotlight", () => {
    expect(dimOf(null, "visits")).toBe(1)
  })

  it("scales non-spotlighted series by DIM and leaves the spotlight at 1", () => {
    expect(dimOf("visits", "visits")).toBe(1)
    expect(dimOf("visits", "clicks")).toBe(DIM)
  })

  it("is the single source of the 0.3 canvas dim tier", () => {
    // Both the DOM (`opacity-40`) and the canvas dim must move together; DIM
    // is the shared constant so they can't drift apart silently.
    expect(DIM).toBe(0.3)
  })
})
