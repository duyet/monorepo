import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@duyet/components";
import { cn } from "@duyet/libs/utils";
import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  children,
  className,
  action,
}: ChartCardProps) {
  return (
    <Card className={cn("shadow-none", className)}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 p-4 pb-0">
        <div className="min-w-0 space-y-1">
          <CardTitle className="font-sans text-sm font-semibold tracking-tight text-foreground">
            {title}
          </CardTitle>
          {subtitle ? (
            <CardDescription className="text-xs leading-relaxed">
              {subtitle}
            </CardDescription>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className="p-4 pt-3">{children}</CardContent>
    </Card>
  );
}
