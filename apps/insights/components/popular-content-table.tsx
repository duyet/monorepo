"use client"

import { ArrowUpRight } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface ContentItem {
  name: string
  value: number
  href?: string
}

interface PopularContentTableProps {
  data: ContentItem[]
  className?: string
}

export function PopularContentTable({ data, className }: PopularContentTableProps) {
  if (!data || data.length === 0) {
    return (
      <div className={cn("rounded-lg border bg-card p-4", className)}>
        <p className="text-sm text-muted-foreground">No data available</p>
      </div>
    )
  }
  
  const values = data.map(item => Number(item.value) || 0).filter(v => !isNaN(v) && v > 0)
  const maxValue = values.length > 0 ? Math.max(...values) : 1
  
  return (
    <div className={cn("rounded-lg border bg-card", className)}>
      <div className="p-4 border-b">
        <h3 className="text-sm font-medium">Most Popular Content</h3>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50%]">Page</TableHead>
            <TableHead className="text-right">Visitors</TableHead>
            <TableHead className="text-right w-16">%</TableHead>
            <TableHead className="w-8"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item, index) => {
            const itemValue = Number(item.value) || 0
            const percentage = maxValue > 0 && itemValue > 0 ? Math.round((itemValue / maxValue) * 100) : 0
            const isTop = index < 3
            // Ensure path starts with / and show root as /
            const cleanPath = item.name === '/' ? '/' : (item.name.startsWith('/') ? item.name : `/${item.name}`)
            
            return (
              <TableRow key={index} className="group">
                <TableCell className="font-medium">
                  <div className="flex items-center space-x-2">
                    <span className={cn(
                      "text-xs font-mono w-5 text-center",
                      isTop ? "text-orange-600 font-semibold" : "text-muted-foreground"
                    )}>
                      {index + 1}
                    </span>
                    <span className="truncate text-sm">
                      {cleanPath.length > 30 ? `${cleanPath.slice(0, 30)}...` : cleanPath}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="text-right font-mono text-sm">
                  {itemValue.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <span className="text-xs text-muted-foreground font-mono">
                    {percentage}%
                  </span>
                </TableCell>
                <TableCell>
                  {item.href ? (
                    <a 
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <ArrowUpRight className="h-3 w-3 text-muted-foreground" />
                    </a>
                  ) : (
                    <div className="h-3 w-3" />
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}