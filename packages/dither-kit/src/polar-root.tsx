"use client"

import type { ComponentType, ReactNode } from "react"
import type { ChartConfig, Margins } from "./chart-context"
import { CommonChartContext } from "./common-context"
import type { BloomInput } from "./dither-paint"
import { partitionByLayer } from "./layers"
import { cn } from "./lib"
import { axisAtAngle, sliceAtAngle } from "./polar"
import { PolarChartContext, usePolarController } from "./polar-context"
import type { ChartRow as Row } from "./row"
import { useChartDimensions } from "./use-chart-dimensions"

const DEFAULT_POLAR_MARGINS: Margins = {
  top: 22,
  right: 14,
  bottom: 14,
  left: 14,
}

export type PolarRootProps<TData extends Row> = {
  chartType: "pie" | "radar"
  /** Family painter — `PieCanvas` or `RadarCanvas`; ships with each chart. */
  Canvas: ComponentType
  /** Extra back-layer SVG content (e.g. the radar frame). */
  backDecoration?: ReactNode
  data: TData[]
  config: ChartConfig
  children: ReactNode
  dataKey: string
  nameKey: string
  innerRadius?: number // 0–1 ratio (donut); pie only
  margins?: Partial<Margins>
  className?: string
  animate?: boolean
  animationDuration?: number
  replayToken?: number
  bloom?: BloomInput
  bloomOnHover?: boolean
  defaultSelectedDataKey?: string | null
  onSelectionChange?: (key: string | null) => void
}

export function PolarRoot<TData extends Row>({
  chartType,
  Canvas,
  backDecoration,
  data,
  config,
  children,
  dataKey,
  nameKey,
  innerRadius = 0,
  margins: marginsProp,
  className,
  animate = true,
  animationDuration = 900,
  replayToken = 0,
  bloom = "off",
  bloomOnHover = false,
  defaultSelectedDataKey = null,
  onSelectionChange,
}: PolarRootProps<TData>) {
  const { ref, size } = useChartDimensions<HTMLDivElement>()
  const margins = { ...DEFAULT_POLAR_MARGINS, ...marginsProp }

  const ctx = usePolarController({
    chartType,
    // Safe: the controller only reads row[key] for the configured keys.
    data: data as Record<string, unknown>[],
    config,
    dataKey,
    nameKey,
    innerRadiusRatio: innerRadius,
    dimensions: size,
    margins,
    animate,
    animationDuration,
    replayToken,
    bloom,
    bloomOnHover,
    defaultSelectedDataKey,
    onSelectionChange,
  })

  const { back: backChildren, svg: svgChildren, dom: domChildren } =
    partitionByLayer(children)

  const onMove = (clientX: number, clientY: number) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const dx = clientX - rect.left - margins.left - ctx.center.x
    const dy = clientY - rect.top - margins.top - ctx.center.y
    const angle = Math.atan2(dy, dx)
    const r = Math.hypot(dx, dy)
    if (chartType === "pie" && ctx.pie) {
      const inside = r <= ctx.outerRadius && r >= ctx.innerRadius
      const i = inside ? sliceAtAngle(ctx.pie, angle) : -1
      ctx.setHoverIndex(i >= 0 ? i : null)
    } else if (ctx.radar) {
      ctx.setHoverIndex(axisAtAngle(ctx.radar.axes, angle))
    }
    ctx.setCursor(clientX - rect.left, clientY - rect.top)
  }

  return (
    <PolarChartContext value={ctx}>
      <CommonChartContext value={ctx.common}>
        <div
          ref={ref}
          className={cn("relative h-full w-full", className)}
          onPointerEnter={() => ctx.setMouseInChart(true)}
          onPointerMove={(e) => onMove(e.clientX, e.clientY)}
          onPointerLeave={() => {
            ctx.setMouseInChart(false)
            ctx.setHoverIndex(null)
          }}
        >
          {ctx.ready && (
            <svg
              width={size.width}
              height={size.height}
              className="absolute inset-0 overflow-visible"
              aria-hidden
              role="presentation"
            >
              <g transform={`translate(${margins.left},${margins.top})`}>
                {backDecoration}
                {backChildren}
              </g>
            </svg>
          )}
          <Canvas />
          {ctx.ready && (
            <svg
              width={size.width}
              height={size.height}
              className="absolute inset-0 overflow-visible"
              role="img"
              aria-label="Chart"
            >
              <g transform={`translate(${margins.left},${margins.top})`}>
                {svgChildren}
              </g>
            </svg>
          )}
          {domChildren}
        </div>
      </CommonChartContext>
    </PolarChartContext>
  )
}
