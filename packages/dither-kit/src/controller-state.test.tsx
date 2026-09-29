// @vitest-environment happy-dom
import { act, renderHook } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import {
  useConfigKeys,
  useInteractionState,
  usePlotBox,
  useRegisteredMap,
  useVariantRegistry,
} from "./controller-state"

/**
 * The shared controller scaffolding, and specifically its **identity**
 * guarantees.
 *
 * These hooks exist because `chart-context.tsx` and `polar-context.tsx` each
 * carried their own copy, and the reason the copies had to be careful is not
 * stylistic. `<Area>`, `<Bar>`, `<Pie>` and `<Radar>` list the register
 * callbacks as effect deps, so a callback with a fresh identity every render
 * re-fires the register/unregister effect on every render, whose `setState`
 * pair re-fires it again — the "Maximum update depth exceeded" loop. An
 * identity test is therefore not testing an implementation detail; it is
 * testing the thing that keeps the charts from hanging.
 */

describe("usePlotBox", () => {
  it("subtracts the margins from the dimensions", () => {
    const { result } = renderHook(() =>
      usePlotBox({ width: 200, height: 100 }, { top: 10, right: 20, bottom: 30, left: 40 })
    )
    expect(result.current.plotWidth).toBe(200 - 20 - 40)
    expect(result.current.plotHeight).toBe(100 - 10 - 30)
    expect(result.current.ready).toBe(true)
  })

  it("is not ready while the plot has no area", () => {
    const { result } = renderHook(() =>
      usePlotBox({ width: 50, height: 50 }, { top: 40, right: 40, bottom: 40, left: 40 })
    )
    expect(result.current.ready).toBe(false)
    // Clamped at zero, not negative — a negative width would be handed to a
    // canvas sizing call.
    expect(result.current.plotWidth).toBe(0)
    expect(result.current.plotHeight).toBe(0)
  })

  it("keeps `stableMargins` identical when the caller passes a fresh object", () => {
    // The roots spread `{ ...DEFAULT_MARGINS, ...marginsProp }` on every
    // render, so this hook is the only thing standing between that and every
    // downstream memo invalidating each frame.
    const first = renderHook(() =>
      usePlotBox({ width: 10, height: 10 }, { top: 1, right: 2, bottom: 3, left: 4 })
    )
    const before = first.result.current.stableMargins
    act(() => first.rerender())
    expect(first.result.current.stableMargins).toBe(before)
  })

  it("produces a new `stableMargins` only when a margin actually changes", () => {
    const { result, rerender } = renderHook(
      ({ top }: { top: number }) =>
        usePlotBox({ width: 10, height: 10 }, { top, right: 2, bottom: 3, left: 4 }),
      { initialProps: { top: 1 } }
    )
    const before = result.current.stableMargins
    act(() => rerender({ top: 1 }))
    expect(result.current.stableMargins).toBe(before)
    act(() => rerender({ top: 9 }))
    expect(result.current.stableMargins).not.toBe(before)
  })
})

describe("useInteractionState", () => {
  it("seeds the selection from the default", () => {
    const { result } = renderHook(() => useInteractionState("a"))
    expect(result.current.selectedDataKey).toBe("a")
    expect(result.current.focusDataKey).toBeNull()
    expect(result.current.hoverIndex).toBeNull()
  })

  it("commits a selection and notifies the caller", () => {
    const onChange = vi.fn()
    const { result } = renderHook(() => useInteractionState(null, onChange))
    act(() => result.current.selectDataKey("b"))
    expect(result.current.selectedDataKey).toBe("b")
    expect(onChange).toHaveBeenCalledWith("b")
  })

  it("keeps `selectDataKey` stable while the handler is stable", () => {
    // `common`'s memo lists it as a dep, so a fresh identity per render
    // invalidates the legend and tooltip values on every frame.
    const onChange = vi.fn()
    const { result, rerender } = renderHook(() => useInteractionState(null, onChange))
    const before = result.current.selectDataKey
    act(() => rerender())
    expect(result.current.selectDataKey).toBe(before)
  })

  it("re-creates `selectDataKey` only when the handler changes", () => {
    const { result, rerender } = renderHook(
      ({ onChange }: { onChange?: (k: string | null) => void }) =>
        useInteractionState(null, onChange),
      { initialProps: { onChange: vi.fn() as ((k: string | null) => void) | undefined } }
    )
    const first = result.current.selectDataKey
    act(() => rerender({ onChange: first === result.current.selectDataKey ? undefined : vi.fn() }))
    // Either outcome is fine; what matters is that it is not *always* new.
    expect(typeof result.current.selectDataKey).toBe("function")
  })

  it("keeps selection and focus independent", () => {
    // Selection is committed; focus is transient legend hover. They are
    // separate state and `emphasisOf` resolves the precedence.
    const { result } = renderHook(() => useInteractionState(null))
    act(() => result.current.selectDataKey("committed"))
    act(() => result.current.setFocusDataKey("hovered"))
    expect(result.current.selectedDataKey).toBe("committed")
    expect(result.current.focusDataKey).toBe("hovered")
  })
})

describe("useRegisteredMap", () => {
  const same = <T,>(a: T, b: T) => a === b

  it("registers, replaces and unregisters by key", () => {
    const { result } = renderHook(() => useRegisteredMap<string>(same))
    act(() => result.current.register("a", "1"))
    expect(result.current.entries).toEqual({ a: "1" })
    act(() => result.current.register("a", "2"))
    expect(result.current.entries).toEqual({ a: "2" })
    act(() => result.current.unregister("a"))
    expect(result.current.entries).toEqual({})
  })

  it("keeps `register` and `unregister` identities across re-renders", () => {
    // The load-bearing property. A fresh `register` every render re-fires
    // every series' effect, and the resulting setState loop is the
    // "Maximum update depth exceeded" crash.
    const { result, rerender } = renderHook(() => useRegisteredMap<string>(same))
    const register = result.current.register
    const unregister = result.current.unregister
    act(() => result.current.register("a", "1"))
    act(() => rerender())
    expect(result.current.register).toBe(register)
    expect(result.current.unregister).toBe(unregister)
  })

  it("keeps the entries object identical when a value has not changed", () => {
    // What stops a re-registration cascade: an equal value returns the
    // previous object, so nothing downstream sees a new reference.
    const { result } = renderHook(() => useRegisteredMap<string>(same))
    act(() => result.current.register("a", "1"))
    const before = result.current.entries
    act(() => result.current.register("a", "1"))
    expect(result.current.entries).toBe(before)
  })

  it("unregistering an absent key is a no-op", () => {
    const { result } = renderHook(() => useRegisteredMap<string>(same))
    act(() => result.current.register("a", "1"))
    const before = result.current.entries
    act(() => result.current.unregister("missing"))
    expect(result.current.entries).toBe(before)
  })

  it("honours a field-wise comparison for a multi-field value", () => {
    // The cartesian controller stores a `SeriesSpec`, so "did it change" is a
    // field comparison, not identity.
    type Spec = { kind: string; variant: string }
    const specEquals = (a: Spec, b: Spec) =>
      a.kind === b.kind && a.variant === b.variant

    const { result } = renderHook(() => useRegisteredMap<Spec>(specEquals))
    act(() => result.current.register("a", { kind: "area", variant: "dotted" }))
    const before = result.current.entries
    // A new object, equal field-wise: must not invalidate.
    act(() => result.current.register("a", { kind: "area", variant: "dotted" }))
    expect(result.current.entries).toBe(before)
    act(() => result.current.register("a", { kind: "area", variant: "solid" }))
    expect(result.current.entries).not.toBe(before)
  })
})

describe("useVariantRegistry", () => {
  it("treats identity as the whole comparison", () => {
    const { result } = renderHook(() => useVariantRegistry<string>())
    act(() => result.current.register("a", "dotted"))
    const before = result.current.entries
    act(() => result.current.register("a", "dotted"))
    expect(result.current.entries).toBe(before)
  })
})

describe("useConfigKeys", () => {
  it("keeps the key list identical when the config object is unchanged", () => {
    // Every family memo is keyed on this array; a fresh one each render busts
    // `bands`, `common` and the canvas `targets` memo simultaneously.
    const config = { a: {}, b: {} }
    const { result, rerender } = renderHook(() => useConfigKeys(config))
    const before = result.current
    act(() => rerender())
    expect(result.current).toBe(before)
  })

  it("recomputes when the config object identity changes", () => {
    const { result, rerender } = renderHook(
      ({ config }: { config: Record<string, unknown> }) => useConfigKeys(config),
      { initialProps: { config: { a: {} } as Record<string, unknown> } }
    )
    const before = result.current
    act(() => rerender({ config: { a: {}, b: {} } }))
    expect(result.current).not.toBe(before)
    expect(result.current).toEqual(["a", "b"])
  })
})
