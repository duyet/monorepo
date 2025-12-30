"use client";

import { cn } from "@duyet/libs";

interface LegendProps {
  categories: string[];
  className?: string;
}

const chartColors = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(30, 80%, 55%)",   // orange
  "hsl(280, 65%, 60%)",  // purple
  "hsl(180, 60%, 45%)",  // teal
  "hsl(340, 75%, 55%)",  // pink
  "hsl(60, 70%, 50%)",   // yellow
  "hsl(200, 70%, 50%)",  // sky blue
  "hsl(140, 60%, 45%)",  // green
];

export function Legend({ categories, className }: LegendProps) {
  return (
    <div className={cn("flex flex-wrap gap-4", className)}>
      {categories.map((category, index) => (
        <div key={category} className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded-full"
            style={{ backgroundColor: chartColors[index % chartColors.length] }}
          />
          <span className="text-sm text-muted-foreground">{category}</span>
        </div>
      ))}
    </div>
  );
}
