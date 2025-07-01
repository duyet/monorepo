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
    <div className={cn("space-y-2", className)}>
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100
        
        const ItemContent = () => (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium truncate">{item.name}</span>
              <span className="text-xs text-muted-foreground ml-2">{item.value.toLocaleString()}</span>
            </div>
            <Progress value={percentage} className="h-1.5" />
          </>
        )
        
        return (
          <div key={index}>
            {item.href ? (
              <Link href={item.href} className="block p-2 rounded-md hover:bg-muted/50 transition-colors">
                <ItemContent />
              </Link>
            ) : (
              <div className="p-2">
                <ItemContent />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}