import { Clock, Server, Zap } from "lucide-react";
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

export function OverviewDashboard({ aiMetrics, wakaTimeMetrics }: OverviewDashboardProps) {
  const aiTokens =
    aiMetrics ? formatTokens(aiMetrics.totalTokens) : null;

  const codingHours =
    wakaTimeMetrics ? wakaTimeMetrics.totalHours.toFixed(1) : null;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground">
          Key metrics and insights across all analytics sources
        </p>
      </div>

      {/* Key Performance Indicators */}
      <div className="space-y-3">
        <h2 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Key Performance Indicators • Last 30 Days
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CompactCard padding="sm">
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

          <CompactCard padding="sm">
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
        </div>
      </div>

      {/* Homelab Overview */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold">Homelab Overview</h2>
        <CompactCard padding="sm">
          <a
            href="https://homelab.duyet.net"
            target="_blank"
            rel="noopener noreferrer"
            className="group block"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-950">
                  <Server className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="space-y-1">
                  <div className="text-sm font-medium group-hover:text-blue-600">
                    View on homelab dashboard
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Infrastructure monitoring and homelab documentation
                  </div>
                </div>
              </div>
              <div className="text-sm font-medium text-blue-600 group-hover:text-blue-700">
                →
              </div>
            </div>
          </a>
        </CompactCard>
      </div>
    </div>
  );
}
