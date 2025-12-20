import { CompactMetric } from "@/components/ui/CompactMetric";
import { Calendar, GitCommit, Zap } from "lucide-react";
import type { CommitStats } from "../utils/types";

interface CommitMetricsProps {
  stats: CommitStats;
}

export function CommitMetrics({ stats }: CommitMetricsProps) {
  const metrics = [
    {
      label: "Total Commits",
      value: stats.totalCommits.toLocaleString(),
      icon: <GitCommit className="h-4 w-4" />,
      change: stats.totalCommits > 0 ? { value: 12 } : undefined,
    },
    {
      label: "Avg/Week",
      value: Math.round(stats.avgCommitsPerWeek).toString(),
      icon: <Zap className="h-4 w-4" />,
      change: stats.avgCommitsPerWeek > 0 ? { value: 8 } : undefined,
    },
    {
      label: "Most Active",
      value: stats.mostActiveDay,
      icon: <Calendar className="h-4 w-4" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {metrics.map((metric) => (
        <CompactMetric
          key={metric.label}
          label={metric.label}
          value={metric.value}
          change={metric.change}
          icon={metric.icon}
        />
      ))}
    </div>
  );
}
