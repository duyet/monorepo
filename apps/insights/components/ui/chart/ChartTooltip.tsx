'use client'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'
import { cn } from '@/lib/utils'
import { useChart } from './context'
import { getPayloadConfigFromPayload } from './utils'

export const ChartTooltip = RechartsPrimitive.Tooltip

export const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  {
    active?: boolean
    payload?: Array<Record<string, unknown>>
    label?: string
    className?: string
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: 'line' | 'dot' | 'dashed'
    nameKey?: string
    labelKey?: string
    labelFormatter?: (value: unknown, payload: unknown) => React.ReactNode
    labelClassName?: string
    formatter?: (
      value: unknown,
      name: unknown,
      item: unknown,
      index: number,
      payload: unknown,
    ) => React.ReactNode
    color?: string
  }
>(
  (
    {
      active,
      payload,
      className,
      indicator = 'dot',
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    },
    ref,
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || item.dataKey || item.name || 'value'}`
      const itemConfig = getPayloadConfigFromPayload(config, item, key)
      const value =
        !labelKey && typeof label === 'string'
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter && (value || value === 0)) {
        return labelFormatter(value, payload)
      }

      return value
    }, [label, labelFormatter, payload, hideLabel, labelKey, config])

    if (!active || !payload?.length) {
      return null
    }

    return (
      <div
        ref={ref}
        className={cn(
          'border-border/50 grid min-w-[8rem] items-start gap-1.5 rounded-lg border bg-background px-2.5 py-1.5 text-xs shadow-xl',
          className,
        )}
      >
        {tooltipLabel ? (
          <div className={cn('font-medium', labelClassName)}>
            {tooltipLabel}
          </div>
        ) : null}
        <div className="grid gap-1.5">
          {payload.map((item, index) => {
            const key = `${nameKey || item.name || item.dataKey || 'value'}`
            const itemConfig = getPayloadConfigFromPayload(config, item, key)
            const indicatorColor =
              color ||
              (item.payload &&
              typeof item.payload === 'object' &&
              item.payload !== null &&
              key in item.payload
                ? (item.payload as Record<string, unknown>)[key]
                : undefined) ||
              item.color

            return (
              <div
                key={String(item.dataKey || index)}
                className={cn(
                  'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
                  indicator === 'dot' && 'items-center',
                )}
              >
                {formatter && (itemConfig?.icon || !hideIndicator) ? (
                  <div
                    className={cn('shrink-0', indicator === 'dot' && 'mt-1')}
                  >
                    {itemConfig?.icon ? (
                      <itemConfig.icon />
                    ) : (
                      <div
                        className={cn(
                          'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
                          {
                            'h-2.5 w-2.5': indicator === 'dot',
                            'w-1': indicator === 'line',
                            'w-0 border-[1.5px] border-dashed bg-transparent':
                              indicator === 'dashed',
                            'my-0.5': indicator !== 'dot',
                          },
                        )}
                        style={
                          {
                            '--color-bg': indicatorColor,
                            '--color-border': indicatorColor,
                          } as React.CSSProperties
                        }
                      />
                    )}
                  </div>
                ) : null}
                <div
                  className={cn(
                    'flex flex-1 justify-between leading-none',
                    hideIndicator && 'items-center',
                  )}
                >
                  <div className="grid gap-1.5">
                    <span className="text-muted-foreground">
                      {itemConfig?.label || String(item.name || 'Value')}
                    </span>
                  </div>
                  {formatter ? (
                    formatter(item.value, item.name, item, index, item.payload)
                  ) : (
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {String(item.value || '')}
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    )
  },
)

ChartTooltipContent.displayName = 'ChartTooltipContent'