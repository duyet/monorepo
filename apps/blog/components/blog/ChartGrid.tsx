"use client";

import { cn } from "@duyet/libs/utils";

export interface ChartItem {
  label: string;
  value: number;
  max?: number;
  color?: string;
  unit?: string;
}

interface ChartGridProps {
  title?: string;
  items: ChartItem[];
  type?: "bar" | "progress";
  className?: string;
}

/**
 * ChartGrid - Simple data visualization for metrics
 * Inspired by HTML effectiveness pattern for reports
 */
export function ChartGrid({
  title,
  items,
  type = "bar",
  className = "",
}: ChartGridProps) {
  const maxValue = Math.max(...items.map((i) => i.max ?? i.value));

  return (
    <div
      className={cn(
        "my-8 p-6 rounded-lg bg-muted border border-border",
        className
      )}
    >
      {title && (
        <h4 className="mb-4 font-serif text-lg text-foreground">
          {title}
        </h4>
      )}
      <div className="space-y-4">
        {items.map((item, index) => {
          const percentage = (item.value / (item.max ?? maxValue)) * 100;
          const color = item.color || "var(--primary)";

          return (
            <div key={index} className="group">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-sm font-medium text-foreground">
                  {item.label}
                </span>
                <span className="font-mono text-sm text-muted-foreground">
                  {item.value}
                  {item.unit || ""}
                </span>
              </div>
              {type === "bar" ? (
                <div className="h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
                  <div
                    className="h-full transition-all duration-500 ease-out rounded-full group-hover:opacity-80"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                  />
                </div>
              ) : (
                <div className="h-8 bg-[var(--background-secondary)] rounded overflow-hidden relative">
                  <div
                    className="h-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                    style={{ width: `${percentage}%`, backgroundColor: color }}
                  >
                    {percentage > 15 && (
                      <span className="text-xs font-medium text-white mix-blend-difference">
                        {Math.round(percentage)}%
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: number;
  unit?: string;
  className?: string;
}

/**
 * StatCard - Single metric display card
 */
export function StatCard({
  label,
  value,
  change,
  unit,
  className = "",
}: StatCardProps) {
  return (
    <div
      className={cn(
        "p-4 rounded-lg bg-card border border-border",
        className
      )}
    >
      <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
        {label}
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-2xl font-serif text-foreground">
          {value}
        </span>
        {unit && <span className="text-sm text-muted-foreground">{unit}</span>}
      </div>
      {change !== undefined && (
        <div
          className={cn(
            "text-xs font-medium mt-1",
            change > 0
              ? "text-green-600 dark:text-green-400"
              : "text-red-600 dark:text-red-400"
          )}
        >
          {change > 0 ? "+" : ""}
          {change}%
        </div>
      )}
    </div>
  );
}

interface StatGridProps {
  stats: Array<{
    label: string;
    value: string | number;
    change?: number;
    unit?: string;
  }>;
  className?: string;
}

/**
 * StatGrid - Grid of metric cards
 */
export function StatGrid({ stats, className = "" }: StatGridProps) {
  return (
    <div
      className={cn("my-8 grid grid-cols-2 lg:grid-cols-4 gap-4", className)}
    >
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}

export default ChartGrid;
