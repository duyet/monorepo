import { ArrowUpRight, Clock, Server, Zap } from "lucide-react";
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

interface OverviewDashboardProps {
  aiMetrics: CCUsageMetricsData | null;
  wakaTimeMetrics: WakaTimeMetricsData | null;
}

export function OverviewDashboard({
  aiMetrics,
  wakaTimeMetrics,
}: OverviewDashboardProps) {
  const aiTokens = aiMetrics ? formatTokens(aiMetrics.totalTokens) : null;

  const codingHours = wakaTimeMetrics
    ? wakaTimeMetrics.totalHours.toFixed(1)
    : null;

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="max-w-3xl space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Insights
        </p>
        <h1 className="text-4xl font-semibold leading-[0.98] tracking-tight sm:text-5xl lg:text-6xl">
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
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <CompactCard padding="sm" className="bg-[#dceafa]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>Coding Hours</span>
              </div>
              {codingHours !== null ? (
                <>
                  <div className="text-lg font-semibold">{codingHours}</div>
                  <div className="text-xs text-muted-foreground">
                    last 30 days
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Unavailable</div>
              )}
            </div>
          </CompactCard>

          <CompactCard padding="sm" className="bg-[#dcefe7]">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Zap className="h-3 w-3" />
                <span>AI Tokens</span>
              </div>
              {aiTokens !== null ? (
                <>
                  <div className="text-lg font-semibold">{aiTokens}</div>
                  <div className="text-xs text-muted-foreground">
                    last 30 days
                  </div>
                </>
              ) : (
                <div className="text-sm text-muted-foreground">Unavailable</div>
              )}
            </div>
          </CompactCard>

          <CompactCard padding="sm" className="bg-[#f2dedb]">
            <a
              href="https://homelab.duyet.net"
              target="_blank"
              rel="noopener noreferrer"
              className="group block"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/70">
                    <Server className="h-4 w-4 text-neutral-950" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-semibold group-hover:underline group-hover:underline-offset-4">
                      Homelab dashboard
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Infrastructure monitoring and homelab documentation
                    </div>
                  </div>
                </div>
                <ArrowUpRight className="h-4 w-4 shrink-0" />
              </div>
            </a>
          </CompactCard>
        </div>
      </div>
    </div>
  );
}
