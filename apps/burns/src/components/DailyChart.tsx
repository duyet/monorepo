import type { DailyEntry } from "../lib/types";

interface DailyChartProps {
  daily: DailyEntry[];
}

export function DailyChart({ daily }: DailyChartProps) {
  const recent = daily.slice(0, 60);
  if (recent.length === 0) return null;

  const maxTokens = Math.max(...recent.map((d) => d.total_tokens));
  const barWidth = 100 / recent.length;
  const chartHeight = 80;

  return (
    <div className="animate-fade-in-delay" style={{ width: "100%", maxWidth: 640, margin: "0 auto" }}>
      <p style={{
        marginBottom: 8,
        textAlign: "center",
        fontSize: 11,
        letterSpacing: "0.04em",
        color: "var(--muted-soft)",
      }}>
        Last {recent.length} days
      </p>
      <svg
        viewBox={`0 0 100 ${chartHeight}`}
        style={{ width: "100%", height: 80, display: "block" }}
        preserveAspectRatio="none"
      >
        {recent.map((day, i) => {
          const height = maxTokens > 0 ? (day.total_tokens / maxTokens) * chartHeight : 0;
          const gap = barWidth * 0.2;
          const w = barWidth - gap;
          const x = i * barWidth + gap / 2;
          const y = chartHeight - height;
          return (
            <rect
              key={day.date}
              x={x}
              y={y}
              width={w}
              height={height}
              fill="var(--hairline)"
              className="transition-colors hover:fill-[var(--muted-soft)]"
            >
              <title>
                {day.date}: {day.total_tokens.toLocaleString("en-US")} tokens (${day.cost.toFixed(2)})
              </title>
            </rect>
          );
        })}
      </svg>
    </div>
  );
}
