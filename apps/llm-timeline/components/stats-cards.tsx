import { cn } from "@duyet/libs/utils";
import { Link } from "@tanstack/react-router";
import { Building2, Database, Sparkles, TrendingUp } from "lucide-react";
import type { ReactNode } from "react";

interface StatsCardsProps {
  models: number;
  organizations: number;
  years?: number;
  activeView?: "models" | "organizations";
  sourceStats?: Record<string, number>;
}

interface StatTileBaseProps {
  icon: ReactNode;
  value: string | number;
  label: string;
  sublabel?: string;
  active?: boolean;
}

function StatTileDiv({
  icon: _icon,
  value,
  label,
  sublabel,
  active,
}: StatTileBaseProps) {
  return (
    <div
      className={cn(
        "signal-tile flex min-w-0 cursor-pointer flex-col gap-2 border-none bg-[var(--rd-surface)] p-[18px_20px] text-left text-inherit no-underline",
        active && "bg-[var(--rd-surface-2)]"
      )}
    >
      <div className="rd-eyebrow flex items-center gap-1.5 text-[10.5px]">
        {label}
      </div>
      <div className={cn("text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.9rem]", active && "text-[var(--rd-accent-ink)]")}>
        {typeof value === "number" ? value.toLocaleString() : value}
        {sublabel && <span className="rd-unit">{sublabel}</span>}
      </div>
    </div>
  );
}

function StatTileLink({
  icon: _icon,
  value,
  label,
  sublabel,
  active,
  to,
}: StatTileBaseProps & { to: string }) {
  return (
    <Link
      to={to}
      className={cn(
        "signal-tile flex min-w-0 cursor-pointer flex-col gap-2 border-none bg-[var(--rd-surface)] p-[18px_20px] text-left text-inherit no-underline",
        active && "bg-[var(--rd-surface-2)]"
      )}
    >
      <div className="rd-eyebrow flex items-center gap-1.5 text-[10.5px]">
        {label}
      </div>
      <div className={cn("text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.9rem]", active && "text-[var(--rd-accent-ink)]")}>
        {typeof value === "number" ? value.toLocaleString() : value}
        {sublabel && <span className="rd-unit">{sublabel}</span>}
      </div>
    </Link>
  );
}

export function StatsCards({
  models,
  organizations,
  years,
  activeView,
  sourceStats,
}: StatsCardsProps) {
  const sourceCount = sourceStats ? Object.keys(sourceStats).length : 0;

  return (
    <div className="signalbar">
      <StatTileLink
        to="/"
        icon={<Sparkles className="h-5 w-5 text-[var(--rd-text)]" />}
        value={models.toLocaleString()}
        label="Models"
        active={activeView === "models"}
      />
      <StatTileLink
        to="/org"
        icon={<Building2 className="h-5 w-5 text-[var(--rd-text)]" />}
        value={organizations.toLocaleString()}
        label="Organizations"
        active={activeView === "organizations"}
      />
      <StatTileDiv
        icon={<Database className="h-5 w-5 text-[var(--rd-text)]" />}
        value={sourceCount > 0 ? sourceCount.toLocaleString() : "—"}
        label="Sources"
      />
      <StatTileDiv
        icon={<TrendingUp className="h-5 w-5 text-[var(--rd-text)]" />}
        value={years && years > 0 ? years.toLocaleString() : "—"}
        label="Years"
      />
    </div>
  );
}