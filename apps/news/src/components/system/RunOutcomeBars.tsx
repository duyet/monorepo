import type { WorkflowRunRow } from "../../lib/system-queries";

interface RunOutcomeBarsProps {
  runs: WorkflowRunRow[];
  emptyLabel: string;
}

/** Stacked bars of new/merged/rejected items per run, oldest to newest. */
export function RunOutcomeBars({ runs, emptyLabel }: RunOutcomeBarsProps) {
  const chrono = [...runs].reverse();
  const data = chrono.map((r) => ({
    id: r.id,
    started_at: r.started_at,
    new: r.stats?.new ?? r.items_new ?? 0,
    merged: r.stats?.merged ?? 0,
    rejected: r.stats?.rejected ?? 0,
  }));
  const hasAny = data.some((d) => d.new + d.merged + d.rejected > 0);

  if (!hasAny) {
    return <p className="text-sm text-muted-foreground">{emptyLabel}</p>;
  }

  const max = Math.max(...data.map((d) => d.new + d.merged + d.rejected), 1);
  return (
    <div>
      <div className="flex h-28 items-end gap-1">
        {data.map((d) => {
          const total = d.new + d.merged + d.rejected;
          const totalPct = Math.max((total / max) * 100, total > 0 ? 4 : 1);
          return (
            <div
              key={d.id}
              className="group relative flex flex-1 flex-col items-center justify-end"
              title={`${d.started_at ? new Date(d.started_at * 1000).toLocaleString("en-US") : ""}: +${d.new} new · ~${d.merged} merged · −${d.rejected} rejected`}
            >
              <div
                className="flex w-full flex-col justify-end overflow-hidden rounded-t-sm transition-opacity group-hover:opacity-80"
                style={{ height: `${totalPct}%` }}
              >
                {d.rejected > 0 && (
                  <div
                    className="w-full bg-red-500/60"
                    style={{ height: `${(d.rejected / (total || 1)) * 100}%` }}
                  />
                )}
                {d.merged > 0 && (
                  <div
                    className="w-full bg-muted-foreground/50"
                    style={{ height: `${(d.merged / (total || 1)) * 100}%` }}
                  />
                )}
                {d.new > 0 && (
                  <div
                    className="w-full bg-accent"
                    style={{ height: `${(d.new / (total || 1)) * 100}%` }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex items-center gap-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-accent" /> new
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-muted-foreground/50" />{" "}
          merged
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-sm bg-red-500/60" />{" "}
          rejected
        </span>
      </div>
    </div>
  );
}
