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
    <div className="rounded-lg border border-border p-4">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
        {label}
      </p>
      <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-foreground">
        {value}
      </p>
      {sublabel && (
        <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>
      )}
    </div>
  );
}
