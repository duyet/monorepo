import { Calendar, Clock, Code, Zap } from "lucide-react";
import { CompactMetric } from "@/components/ui/CompactMetric";

type WakaMetrics = {
  totalHours: number;
  avgDailyHours: number;
  daysActive: number;
  topLanguage: string;
};

export function WakaTimeMetricsView({ metrics }: { metrics: WakaMetrics }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <CompactMetric
        label="Total Hours"
        value={metrics.totalHours.toFixed(1)}
        icon={<Clock className="h-4 w-4" />}
      />
      <CompactMetric
        label="Daily Average"
        value={metrics.avgDailyHours.toFixed(1)}
        icon={<Zap className="h-4 w-4" />}
      />
      <CompactMetric
        label="Active Days"
        value={metrics.daysActive.toString()}
        icon={<Calendar className="h-4 w-4" />}
      />
      <CompactMetric
        label="Top Language"
        value={metrics.topLanguage}
        icon={<Code className="h-4 w-4" />}
      />
    </div>
  );
}
