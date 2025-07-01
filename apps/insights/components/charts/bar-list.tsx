"use client"

import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface BarListItem {
  name: string
  value: number
  href?: string
}

interface BarListProps {
  data: BarListItem[]
  className?: string
}

export function BarList({ data, className }: BarListProps) {
  const maxValue = Math.max(...data.map(item => item.value))

  return (
    <div className={cn("space-y-4", className)}>
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100
        const content = (
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <p className={cn(
                "text-sm text-muted-foreground truncate flex-1 mr-2",
                item.href && "hover:text-foreground transition-colors"
              )}>
                {item.name}
              </p>
              <p className="font-medium text-sm tabular-nums">
                {typeof item.value === 'number' ? 
                  item.value.toLocaleString() : 
                  item.value
                }
              </p>
            </div>
            <Progress 
              value={percentage} 
              className="h-2"
              style={{
                // Use different colors for each item
                '--progress-foreground': `hsl(var(--chart-${(index % 5) + 1}))`
              } as React.CSSProperties}
            />
          </div>
        )

        if (item.href) {
          return (
            <Link
              key={item.name}
              href={item.href}
              className="block hover:bg-muted/50 transition-colors rounded-md p-2 -m-2"
              target="_blank"
              rel="noopener noreferrer"
            >
              {content}
            </Link>
          )
        }

        return (
          <div key={item.name}>
            {content}
          </div>
        )
      })}
    </div>
  )
}