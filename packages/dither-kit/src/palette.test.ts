import { describe, expect, it } from "vitest"
import { PALETTE, isDitherColor, rgb, seedOfColor } from "./palette"
import type { DitherColor } from "./palette"

describe("rgb", () => {
  it("passes the seed colour through at full alpha by default", () => {
    expect(rgb([40, 210, 110])).toBe("rgba(40,210,110,1)")
  })

  it("scales every channel by k and leaves alpha alone", () => {
    expect(rgb([40, 210, 110], 0.5)).toBe("rgba(20,105,55,1)")
    expect(rgb([40, 210, 110], 1, 0.25)).toBe("rgba(40,210,110,0.25)")
  })

  it("rounds scaled channels to integers", () => {
    // Canvas ignores sub-channel precision; the point is that every emitted
    // rgba() string is a valid, integral-channel CSS colour.
    expect(rgb([40.4, 210.6, 110.2], 0.5)).toBe("rgba(20,105,55,1)")
  })
})

describe("seedOfColor", () => {
  it("returns the seed for every palette member", () => {
    for (const color of Object.keys(PALETTE) as DitherColor[]) {
      expect(seedOfColor(color)).toBe(PALETTE[color])
    }
  })

  it("gives grey a muted fill so empty metrics read as no-data", () => {
    // Both chart roots default an unconfigured series to grey; if this became
    // saturated, missing data would look like a real series.
    const grey = seedOfColor("grey")
    expect(grey.fill).toEqual([92, 92, 100])
    expect(rgb(grey.fill, 1, 1)).toBe("rgba(92,92,100,1)")
  })
})

describe("isDitherColor", () => {
  it("accepts every palette member", () => {
    for (const color of Object.keys(PALETTE)) {
      expect(isDitherColor(color)).toBe(true)
    }
  })

  it("rejects non-members", () => {
    for (const value of ["teal", "", "Green", "green ", null, undefined, 0, 1, {}]) {
      expect(isDitherColor(value)).toBe(false)
    }
  })

  it("CHARACTERIZATION: accepts inherited Object.prototype keys (wrong)", () => {
    // `value in PALETTE` walks the prototype chain, so any Object.prototype
    // member passes the type guard. Harmless today (the guard only narrows
    // chart config read from the user's own source), but it is a real
    // prototype-leak, not an intentional acceptance. A guard written as
    // `Object.hasOwn(PALETTE, value)` would reject these.
    for (const value of ["toString", "constructor", "hasOwnProperty", "__proto__"]) {
      expect(isDitherColor(value)).toBe(true)
    }
    // …and the consequence: seedOfColor then hands back a function, not a Seed.
    expect(typeof seedOfColor("toString" as DitherColor)).toBe("function")
  })
})
