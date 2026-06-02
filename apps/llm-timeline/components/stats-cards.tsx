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
        "rounded-[var(--rd-r)] p-4 transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--rd-ring)] focus-visible:ring-offset-2",
        active
          ? "bg-[var(--rd-surface)] border border-[var(--rd-border)]"
          : "border border-transparent hover:bg-[var(--rd-surface-2)]"
      )}
      {...props}
    >
      <div>
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--rd-r-sm)] bg-[var(--rd-surface-2)]">
          {icon}
        </div>
        <div className="space-y-0.5">
          <div className="text-2xl font-bold font-[family-name:var(--font-mono)] tracking-tight text-[var(--rd-text)] tabular-nums">
            {typeof value === "number" ? value.toLocaleString() : value}
          </div>
          <div className="font-[family-name:var(--font-mono)] text-[11.5px] uppercase tracking-[0.14em] text-[var(--rd-text-3)]">
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
        icon={<Sparkles className="h-5 w-5 text-[var(--rd-text)]" />}
        value={models.toLocaleString()}
        label="Models"
        active={activeView === "models"}
      />
      <StatCard
        as={Link}
        to="/org"
        icon={<Building2 className="h-5 w-5 text-[var(--rd-text)]" />}
        value={organizations.toLocaleString()}
        label="Organizations"
        active={activeView === "organizations"}
      />
      <StatCard
        icon={<Database className="h-5 w-5 text-[var(--rd-text)]" />}
        value={totalSources > 0 ? totalSources.toLocaleString() : "—"}
        label="Sources"
      />
      <StatCard
        icon={<TrendingUp className="h-5 w-5 text-[var(--rd-text)]" />}
        value="76"
        label="Years"
      />
    </div>
  );
}
