import type { WorkflowRunRow } from "../../lib/system-queries";

interface RunDurationBarsProps {
  runs: WorkflowRunRow[];
  emptyLabel: string;
}

function durationSeconds(r: WorkflowRunRow): number | null {
  if (!r.started_at || !r.finished_at) return null;
  return Math.max(r.finished_at - r.started_at, 0);
}

function formatDuration(s: number): string {
  return s < 60 ? `${s}s` : `${Math.round(s / 60)}m`;
}

/** Vertical bars of run duration, oldest to newest, single accent hue. */
export function RunDurationBars({ runs, emptyLabel }: RunDurationBarsProps) {
  const chrono = [...runs].reverse();
  const data = chrono
    .map((r) => ({ id: r.id, started_at: r.started_at, seconds: durationSeconds(r) }))
    .filter((d): d is { id: string; started_at: number | null; seconds: number } => d.seconds !== null);

  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const max = Math.max(...data.map((d) => d.seconds), 1);
  return (
    <div className="flex h-28 items-end gap-1">
      {data.map((d) => (
        <div
          key={d.id}
          className="group relative flex flex-1 flex-col items-center justify-end"
          title={`${d.started_at ? new Date(d.started_at * 1000).toLocaleString("en-US") : ""}: ${formatDuration(d.seconds)}`}
        >
          <div
            className="w-full rounded-t-sm bg-accent transition-opacity group-hover:opacity-80"
            style={{
              height: `${Math.max((d.seconds / max) * 100, d.seconds > 0 ? 4 : 1)}%`,
            }}
          />
        </div>
      ))}
    </div>
  );
}
