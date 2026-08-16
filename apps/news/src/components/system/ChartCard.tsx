import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
}: ChartCardProps) {
  return (
    <div className={`rounded-lg border border-border p-4 ${className ?? ""}`}>
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle && (
        <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
      )}
      <div className="mt-3">{children}</div>
    </div>
  );
}
