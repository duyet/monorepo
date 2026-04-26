import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";
import { Building2, Database, Sparkles, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

interface StatsCardsProps {
  models: number;
  organizations: number;
  activeView?: "models" | "organizations";
  sourceStats?: Record<string, number>;
}

function StatCard({
  icon,
  value,
  label,
  active,
  as: Comp = "div",
  ...props
}: {
  icon: ReactNode;
  value: string | number;
  label: string;
  active?: boolean;
  as?: "div" | typeof Link;
} & Record<string, unknown>) {
  return (
    // @ts-expect-error -- polymorphic component
    <Comp
      className={cn(
        "group relative overflow-hidden rounded-xl p-5 transition-all duration-300",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "bg-card border border-foreground/10 shadow-sm"
          : "bg-muted/30 hover:bg-muted/50 border border-transparent"
      )}
      {...props}
    >
      {/* Decorative gradient accent */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-background/50 border border-border/50">
          {icon}
        </div>
        <div className="space-y-0.5">
          <div className="text-2xl font-bold font-[family-name:var(--font-mono)] tracking-tight text-foreground tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </div>
        </div>
      </div>
    </Comp>
  );
}

export function StatsCards({
  models,
  organizations,
  activeView,
  sourceStats,
}: StatsCardsProps) {
  const totalSources = sourceStats
    ? Object.values(sourceStats).reduce((a, b) => a + b, 0)
    : 0;

  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
      <StatCard
        as={Link}
        to="/"
        icon={<Sparkles className="h-5 w-5 text-foreground" />}
        value={models.toLocaleString()}
        label="Models"
        active={activeView === "models"}
      />
      <StatCard
        as={Link}
        to="/org"
        icon={<Building2 className="h-5 w-5 text-foreground" />}
        value={organizations.toLocaleString()}
        label="Organizations"
        active={activeView === "organizations"}
      />
      <StatCard
        icon={<Database className="h-5 w-5 text-foreground" />}
        value={totalSources > 0 ? totalSources.toLocaleString() : "—"}
        label="Sources"
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5 text-foreground" />}
        value="76"
        label="Years"
      />
    </div>
  );
}
