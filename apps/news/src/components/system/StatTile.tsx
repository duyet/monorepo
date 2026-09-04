import { Card, CardContent } from "@duyet/components";
import type { LucideIcon } from "lucide-react";

interface StatTileProps {
  label: string;
  value: string;
  sublabel?: string;
  icon?: LucideIcon;
}

export function StatTile({
  label,
  value,
  sublabel,
  icon: Icon,
}: StatTileProps) {
  return (
    <Card className="shadow-none">
      <CardContent className="p-4">
        <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
          {Icon ? (
            <Icon className="h-3.5 w-3.5 text-accent" aria-hidden />
          ) : null}
          {label}
        </p>
        <p className="mt-2 font-mono text-2xl font-semibold tracking-tight tabular-nums text-foreground">
          {value}
        </p>
        {sublabel ? (
          <p className="mt-1 text-xs text-muted-foreground">{sublabel}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
