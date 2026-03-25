import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";
import { Building2, Calendar, Database, Sparkles } from "lucide-react";
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
  value: string;
  label: string;
  active?: boolean;
  as?: "div" | typeof Link;
} & Record<string, unknown>) {
  return (
    // @ts-expect-error -- polymorphic component
    <Comp
      className={cn(
        "flex flex-col items-center gap-3 rounded-2xl px-4 py-5 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        active
          ? "bg-card border border-foreground/10"
          : "bg-muted/50 hover:bg-muted/80"
      )}
      {...props}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background">
        {icon}
      </div>
      <div className="text-center">
        <div className="text-2xl font-bold font-[family-name:var(--font-mono)] tracking-tight text-foreground">
          {value}
        </div>
        <div className="mt-0.5 text-xs font-medium text-muted-foreground">
          {label}
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
    <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4 animate-fade-in animate-fade-in-delay-1">
      <StatCard
        as={Link}
        to="/"
        icon={<Sparkles className="h-5 w-5 text-muted-foreground" />}
        value={models.toLocaleString()}
        label="Models"
        active={activeView === "models"}
      />
      <StatCard
        as={Link}
        to="/org"
        icon={<Building2 className="h-5 w-5 text-muted-foreground" />}
        value={organizations.toLocaleString()}
        label="Organizations"
        active={activeView === "organizations"}
      />
      <StatCard
        icon={<Database className="h-5 w-5 text-muted-foreground" />}
        value={totalSources > 0 ? totalSources.toLocaleString() : "—"}
        label="Sources"
      />
      <StatCard
        icon={<Calendar className="h-5 w-5 text-muted-foreground" />}
        value="1950–26"
        label="Years"
      />
    </div>
  );
}
