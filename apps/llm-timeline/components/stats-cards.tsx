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
    <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4 animate-fade-in animate-fade-in-delay-1">
      {/* Models Card */}
      <Link
        to="/"
        className={cn(
          "group rounded-xl border p-5 transition-all hover:shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2",
          activeView === "models"
            ? "border-neutral-300 dark:border-white/20 bg-white dark:bg-[#111] shadow-sm"
            : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] hover:border-neutral-300 dark:hover:border-white/20"
        )}
      >
        <div className="mb-3 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
          <Sparkles className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
        </div>
        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-[family-name:var(--font-mono)] tracking-tight">
          {models.toLocaleString()}
        </div>
        <div className="mt-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Models
        </div>
      </Link>

      {/* Organizations Card */}
      <Link
        to="/org"
        className={cn(
          "group rounded-xl border p-5 transition-all hover:shadow-sm",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-400 dark:focus-visible:ring-neutral-500 focus-visible:ring-offset-2",
          activeView === "organizations"
            ? "border-neutral-300 dark:border-white/20 bg-white dark:bg-[#111] shadow-sm"
            : "border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] hover:border-neutral-300 dark:hover:border-white/20"
        )}
      >
        <div className="mb-3 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
          <Building2 className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
        </div>
        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-[family-name:var(--font-mono)] tracking-tight">
          {organizations.toLocaleString()}
        </div>
        <div className="mt-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Organizations
        </div>
      </Link>

      {/* Data Sources Card */}
      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] p-5 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm">
        <div className="mb-3 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
          <Database className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
        </div>
        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-[family-name:var(--font-mono)] tracking-tight">
          {totalSources > 0 ? totalSources.toLocaleString() : "—"}
        </div>
        <div className="mt-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Data Points
        </div>
      </div>

      {/* Years Covered Card */}
      <div className="rounded-xl border border-neutral-200 dark:border-white/10 bg-white dark:bg-[#111] p-5 transition-all hover:border-neutral-300 dark:hover:border-white/20 hover:shadow-sm">
        <div className="mb-3 inline-flex rounded-lg border border-neutral-200 bg-neutral-100 p-2.5 dark:border-white/10 dark:bg-white/5">
          <Calendar className="h-4 w-4 text-neutral-600 dark:text-neutral-400" />
        </div>
        <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100 font-[family-name:var(--font-mono)] tracking-tight">
          2017–26
        </div>
        <div className="mt-0.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          Years Covered
        </div>
      </div>
    </div>
  );
}
