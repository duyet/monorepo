"use client"

import { useEffect } from "react"
import { type AreaVariant, warnUnconfiguredSeries } from "./chart-context"
import { usePolarPart } from "./polar-context"

export type RadarProps = {
  dataKey: string
  variant?: AreaVariant
}

/**
 * One radar series — a closed polygon over the spokes. Sets this series' fill
 * variant; the dithered polygon is painted on the canvas.
 */
export function Radar({ dataKey, variant = "gradient" }: RadarProps) {
  const ctx = usePolarPart("Radar", "radar")
  const { registerVariant, unregisterVariant } = ctx

  warnUnconfiguredSeries("Radar", dataKey, Boolean(ctx.config[dataKey]))

  useEffect(() => {
    registerVariant(dataKey, variant)
    return () => unregisterVariant(dataKey)
  }, [dataKey, variant, registerVariant, unregisterVariant])

  return null
}
