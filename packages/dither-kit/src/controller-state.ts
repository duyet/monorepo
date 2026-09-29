"use client"

import { useCallback, useMemo, useState } from "react"

/**
 * The state scaffolding shared by the cartesian and polar chart controllers.
 *
 * `chart-context.tsx` and `polar-context.tsx` were written as parallel files
 * and drifted: both grew the same selection/hover/cursor state, the same
 * identity-stable register/unregister map, and the same pinned-margins
 * workaround, each with its own copy of the reasoning. The consequences were
 * real rather than cosmetic — the "Maximum update depth exceeded" comment
 * explaining why the register callbacks must have stable identities appears
 * **twice**, so a fix to one had no reason to reach the other.
 *
 * These hooks are a *mechanical* extraction: the same hooks, in the same
 * order, with the same identities. Nothing is added, and no call site's hook
 * order changes, so the re-render behaviour is unchanged by construction.
 */

/** Margins as the roots spread them: `{ ...DEFAULT_MARGINS, ...marginsProp }`. */
export type Margins = { top: number; right: number; bottom: number; left: number }

export type PlotBox = {
  /** Identity-stable, so it does not invalidate memos on its own. */
  stableMargins: Margins
  plotWidth: number
  plotHeight: number
  /** False while the chart has no area — canvases must not be sized yet. */
  ready: boolean
  /**
   * The individual margins, for callers that clamp a floating element against
   * them (the tooltip's left/right and top limits). Returned individually so
   * they can be listed as memo deps directly — a caller that re-derived them
   * from `margins` would defeat `stableMargins`.
   */
  top: number
  left: number
}

/**
 * The plot rectangle, with margins pinned to a stable object.
 *
 * The roots spread the default margins fresh on every render, so `margins`
 * never keeps its identity and would bust every memo keyed on it. Pinning one
 * object off the four numbers is what keeps that from happening.
 */
export function usePlotBox(
  dimensions: { width: number; height: number },
  margins: Margins
): PlotBox {
  const { top, right, bottom, left } = margins
  const stableMargins = useMemo(
    () => ({ top, right, bottom, left }),
    [top, right, bottom, left]
  )

  const plotWidth = Math.max(0, dimensions.width - left - right)
  const plotHeight = Math.max(0, dimensions.height - top - bottom)

  return {
    stableMargins,
    plotWidth,
    plotHeight,
    ready: plotWidth > 0 && plotHeight > 0,
    top,
    left,
  }
}

export type InteractionState = {
  selectedDataKey: string | null
  /** Transient legend-hover emphasis. Selection wins; see `emphasisOf`. */
  focusDataKey: string | null
  hoverIndex: number | null
  cursorX: number
  cursorY: number
  isMouseInChart: boolean
  setFocusDataKey: (key: string | null) => void
  setHoverIndex: (index: number | null) => void
  setCursorX: (px: number) => void
  setCursorY: (py: number) => void
  setIsMouseInChart: (inside: boolean) => void
  /** Commits a selection and notifies the caller. Identity-stable. */
  selectDataKey: (key: string | null) => void
}

/** Selection, hover and pointer state, identical across both chart families. */
export function useInteractionState(
  defaultSelectedDataKey: string | null,
  onSelectionChange?: (key: string | null) => void
): InteractionState {
  const [selectedDataKey, setSelectedDataKey] = useState<string | null>(
    defaultSelectedDataKey
  )
  const [focusDataKey, setFocusDataKey] = useState<string | null>(null)
  const [hoverIndex, setHoverIndex] = useState<number | null>(null)
  const [cursorX, setCursorX] = useState(0)
  const [cursorY, setCursorY] = useState(0)
  const [isMouseInChart, setIsMouseInChart] = useState(false)

  // useCallback so the memoized context value keeps its identity; re-created
  // only when the caller's handler changes.
  const selectDataKey = useCallback(
    (key: string | null) => {
      setSelectedDataKey(key)
      onSelectionChange?.(key)
    },
    [onSelectionChange]
  )

  return {
    selectedDataKey,
    focusDataKey,
    hoverIndex,
    cursorX,
    cursorY,
    isMouseInChart,
    setFocusDataKey,
    setHoverIndex,
    setCursorX,
    setCursorY,
    setIsMouseInChart,
    selectDataKey,
  }
}

export type RegisteredMap<T> = {
  entries: Record<string, T>
  register: (key: string, value: T) => void
  unregister: (key: string) => void
}

/**
 * A `Record<string, T>` that series parts register into, with callbacks that
 * have **stable identities**.
 *
 * The identities are load-bearing, not an optimisation. `<Area>`, `<Bar>`,
 * `<Pie>` and `<Radar>` list `register*`/`unregister*` as effect deps, so a
 * fresh callback every render re-fires the register/unregister effect on every
 * render, whose `setState` pair then re-fires it again — the
 * "Maximum update depth exceeded" loop both controllers were carrying a
 * comment about.
 *
 * `equals` decides whether a re-registration is a real change. Returning
 * `true` for a value that has not actually changed returns the previous object,
 * which is what stops a re-render from cascading into the memos downstream.
 */
export function useRegisteredMap<T>(
  equals: (previous: T, next: T) => boolean
): RegisteredMap<T> {
  const [entries, setEntries] = useState<Record<string, T>>({})

  const register = useCallback(
    (key: string, value: T) => {
      setEntries((prev) =>
        key in prev && equals(prev[key], value)
          ? prev
          : { ...prev, [key]: value }
      )
    },
    [equals]
  )

  const unregister = useCallback((key: string) => {
    setEntries((prev) => {
      if (!(key in prev)) return prev
      const next = { ...prev }
      delete next[key]
      return next
    })
  }, [])

  return { entries, register, unregister }
}

/**
 * `register`/`unregister` for a single-field value.
 *
 * The common case — `polar-context` stores just an `AreaVariant` per key — where
 * identity comparison is the whole test.
 */
export function useVariantRegistry<T>(): RegisteredMap<T> {
  const equals = useCallback((a: T, b: T) => a === b, [])
  return useRegisteredMap<T>(equals)
}

/**
 * `configKeys`, memoized.
 *
 * Every family memo (`bands`, `common`, the canvas `targets`) is keyed on this
 * array, and a fresh array each render busts all of them at once.
 */
export function useConfigKeys(config: Record<string, unknown>): string[] {
  return useMemo(() => Object.keys(config), [config])
}
