import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";
import { Building2, Calendar, Database, Sparkles } from "lucide-react";

interface StatsCardsProps {
  models: number;
  organizations: number;
  activeView?: "models" | "organizations";
  sourceStats?: Record<string, number>;
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
    <div className="mb-4 flex flex-wrap items-center gap-2 animate-fade-in animate-fade-in-delay-1">
      {/* Models */}
      <Link
        to="/"
        className={cn(
          "group flex items-center gap-2.5 rounded-xl border px-4 py-2.5 transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          activeView === "models"
            ? "border-foreground/20 bg-card"
            : "border-border bg-card hover:border-foreground/20"
        )}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
          <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold font-[family-name:var(--font-mono)] tracking-tight text-foreground">
            {models.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Models
          </span>
        </div>
      </Link>

      {/* Organizations */}
      <Link
        to="/org"
        className={cn(
          "group flex items-center gap-2.5 rounded-xl border px-4 py-2.5 transition-all",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          activeView === "organizations"
            ? "border-foreground/20 bg-card"
            : "border-border bg-card hover:border-foreground/20"
        )}
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
          <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold font-[family-name:var(--font-mono)] tracking-tight text-foreground">
            {organizations.toLocaleString()}
          </span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Orgs
          </span>
        </div>
      </Link>

      {/* Data Points */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 transition-all hover:border-foreground/20">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
          <Database className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold font-[family-name:var(--font-mono)] tracking-tight text-foreground">
            {totalSources > 0 ? totalSources.toLocaleString() : "—"}
          </span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Sources
          </span>
        </div>
      </div>

      {/* Years Covered */}
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-card px-4 py-2.5 transition-all hover:border-foreground/20">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted">
          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold font-[family-name:var(--font-mono)] tracking-tight text-foreground">
            2017–26
          </span>
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Years
          </span>
        </div>
      </div>
    </div>
  );
}
