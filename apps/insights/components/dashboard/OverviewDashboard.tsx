import {
  ArrowUpRight,
  Clock,
  Code2,
  DollarSign,
  Server,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { CCUsageMetricsData } from "@/app/ai/types";
import { CompactCard } from "@/components/ui/CompactCard";

interface WakaTimeMetricsData {
  totalHours: number;
  avgDailyHours: number;
  daysActive: number;
  topLanguage: string;
}

// Format tokens with B/M/K suffixes (consistent with AI tab)
function formatTokens(tokens: number): string {
  if (tokens >= 1000000000) {
    return `${(tokens / 1000000000).toFixed(1)}B`;
  }
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}

function formatCost(cost: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    maximumFractionDigits: cost >= 100 ? 0 : 2,
    style: "currency",
  }).format(cost || 0);
}

interface KpiTileProps {
  icon: LucideIcon;
  label: string;
  value: string | null;
  unit?: string;
  sub?: string;
}

/** Single KPI: icon + label, prominent value, and a small supporting hint. */
function KpiTile({ icon: Icon, label, value, unit, sub }: KpiTileProps) {
  return (
    <CompactCard padding="sm" className="h-full">
      <div className="flex h-full flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Icon aria-hidden="true" className="h-3.5 w-3.5" />
          <span className="uppercase tracking-wide">{label}</span>
        </div>
        {value !== null ? (
          <>
            <div className="text-2xl font-semibold leading-none tracking-tight sm:text-3xl">
              {value}
              {unit ? (
                <span className="ml-0.5 text-base font-medium text-muted-foreground">
                  {unit}
                </span>
              ) : null}
            </div>
            {sub ? (
              <div className="mt-auto text-xs text-muted-foreground">{sub}</div>
            ) : null}
          </>
        ) : (
          <div className="text-sm text-muted-foreground">Unavailable</div>
        )}
      </div>
    </CompactCard>
  );
}

interface OverviewDashboardProps {
  aiMetrics: CCUsageMetricsData | null;
  wakaTimeMetrics: WakaTimeMetricsData | null;
}

export function OverviewDashboard({
  aiMetrics,
  wakaTimeMetrics,
}: OverviewDashboardProps) {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Insights
        </p>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
          Dashboard overview
        </h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
          Key metrics and insights across all analytics sources
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Key Performance Indicators • Last 30 Days
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiTile
            icon={Clock}
            label="Coding Hours"
            value={
              wakaTimeMetrics ? wakaTimeMetrics.totalHours.toFixed(1) : null
            }
            unit="h"
            sub={
              wakaTimeMetrics
                ? `${wakaTimeMetrics.avgDailyHours.toFixed(1)}h avg / active day`
                : undefined
            }
          />

          <KpiTile
            icon={Code2}
            label="Top Language"
            value={wakaTimeMetrics ? wakaTimeMetrics.topLanguage : null}
            sub={
              wakaTimeMetrics
                ? `${wakaTimeMetrics.daysActive} active days`
                : undefined
            }
          />

          <KpiTile
            icon={Zap}
            label="AI Tokens"
            value={aiMetrics ? formatTokens(aiMetrics.totalTokens) : null}
            sub={
              aiMetrics ? `across ${aiMetrics.activeDays} active days` : undefined
            }
          />

          <KpiTile
            icon={DollarSign}
            label="AI Spend"
            value={aiMetrics ? formatCost(aiMetrics.totalCost) : null}
            sub={aiMetrics ? `top model: ${aiMetrics.topModel}` : undefined}
          />
        </div>
      </div>

      {/* Related destinations */}
      <CompactCard padding="sm">
        <a
          href="https://homelab.duyet.net"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted">
              <Server aria-hidden="true" className="h-4 w-4" />
            </div>
            <div className="space-y-0.5">
              <div className="text-sm font-semibold group-hover:underline group-hover:underline-offset-4">
                Homelab dashboard
              </div>
              <div className="text-xs text-muted-foreground">
                Infrastructure monitoring and homelab documentation
              </div>
            </div>
          </div>
          <ArrowUpRight aria-hidden="true" className="h-4 w-4 shrink-0" />
        </a>
      </CompactCard>
    </div>
  );
}
