import { cn } from '@duyet/libs'

export { AreaChart } from './AreaChart'
export { BarChart } from './BarChart'
export { BarList } from './BarList'
export { DonutChart } from './DonutChart'
export { LanguageBarChart } from './LanguageBarChart'
export { Legend } from './legend'

interface MetricProps {
  children: React.ReactNode
  className?: string
}
interface FlexProps {
  children: React.ReactNode
  className?: string
  alignItems?: 'center' | 'start' | 'end' | 'baseline'
  justifyContent?: 'start' | 'center' | 'end' | 'between'
}

export const Metric = ({ children, className }: MetricProps) => (
  <div className={cn('text-3xl font-bold tracking-tight', className)}>
    {children}
  </div>
)

export const Text = ({ children, className }: MetricProps) => (
  <p className={cn('text-sm text-muted-foreground', className)}>{children}</p>
)

export const Flex = ({
  children,
  className,
  alignItems = 'center',
  justifyContent = 'start',
}: FlexProps) => {
  const alignMap = {
    center: 'items-center',
    start: 'items-start',
    end: 'items-end',
    baseline: 'items-baseline',
  }
  const justifyMap = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  }

  return (
    <div
      className={cn(
        'flex',
        alignMap[alignItems],
        justifyMap[justifyContent],
        className,
      )}
    >
      {children}
    </div>
  )
}
