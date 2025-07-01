import React from "react"
import { cn } from "@/lib/utils"

export { AreaChart } from "./area-chart"
export { BarChart } from "./bar-chart"
export { DonutChart } from "./donut-chart"
export { BarList } from "./bar-list"
export { Legend } from "./legend"

// Layout components as simple styled divs
export function Metric({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-2xl font-bold", className)}>{children}</p>
}

export function Text({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>
}

export function Flex({ 
  children, 
  className, 
  alignItems = "center", 
  justifyContent = "start" 
}: { 
  children: React.ReactNode
  className?: string
  alignItems?: "center" | "start" | "end" | "baseline"
  justifyContent?: "start" | "center" | "end" | "between"
}) {
  const alignClasses = {
    center: "items-center",
    start: "items-start", 
    end: "items-end",
    baseline: "items-baseline"
  }
  
  const justifyClasses = {
    start: "justify-start",
    center: "justify-center",
    end: "justify-end", 
    between: "justify-between"
  }

  return (
    <div className={cn("flex", alignClasses[alignItems], justifyClasses[justifyContent], className)}>
      {children}
    </div>
  )
}