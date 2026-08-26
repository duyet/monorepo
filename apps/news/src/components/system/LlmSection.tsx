import type { LlmDayTaskCount } from "../../lib/system-queries";

const TASK_COLORS: Record<string, string> = {
  score: "bg-accent",
  translate: "bg-muted-foreground/50",
  tldr: "bg-emerald-500/70",
};

interface LlmSectionProps {
  data: LlmDayTaskCount[];
  formatTokens: (n: number) => string;
}

function totals(data: LlmDayTaskCount[]) {
  let calls = 0;
  let failures = 0;
  let tokens = 0;
  for (const row of data) {
    calls += row.calls;
    failures += row.failures;
    tokens += row.tokens;
  }
  return { calls, failures, tokens };
}

/** Stacked daily LLM call chart grouped by task. */
export function LlmSection({ data, formatTokens }: LlmSectionProps) {
  if (data.length === 0) {
    return <p className="text-sm text-muted-foreground">No LLM call data yet.</p>;
  }

  const byDate = new Map<string, LlmDayTaskCount[]>();
  for (const row of data) {
    const list = byDate.get(row.date) ?? [];
    list.push(row);
    byDate.set(row.date, list);
  }
  const dates = [...byDate.keys()].sort();
  const maxCalls = Math.max(
    ...dates.map((d) =>
      (byDate.get(d) ?? []).reduce((sum, r) => sum + r.calls, 0)
    ),
    1
  );
  const tasks = [...new Set(data.map((r) => r.task))].sort();
  const { calls, failures, tokens } = totals(data);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span>
          calls{" "}
          <span className="font-mono tabular-nums text-foreground">{calls}</span>
        </span>
        <span>
          failures{" "}
          <span className="font-mono tabular-nums text-foreground">
            {failures}
          </span>
        </span>
        <span>
          tokens{" "}
          <span className="font-mono tabular-nums text-foreground">
            {formatTokens(tokens)}
          </span>
        </span>
      </div>
      <div className="flex flex-wrap gap-2 text-[10px] text-muted-foreground">
        {tasks.map((task) => (
          <span key={task} className="inline-flex items-center gap-1">
            <span
              className={`inline-block h-2 w-2 rounded-sm ${TASK_COLORS[task] ?? "bg-border"}`}
            />
            {task}
          </span>
        ))}
      </div>
      <div className="flex h-28 items-end gap-1">
        {dates.map((date) => {
          const rows = byDate.get(date) ?? [];
          const dayTotal = rows.reduce((sum, r) => sum + r.calls, 0);
          const heightPct = Math.max((dayTotal / maxCalls) * 100, dayTotal ? 4 : 1);
          return (
            <div
              key={date}
              className="group relative flex flex-1 flex-col items-center justify-end"
              title={`${date}: ${dayTotal} calls`}
            >
              <div
                className="flex w-full flex-col justify-end overflow-hidden rounded-t-sm"
                style={{ height: `${heightPct}%` }}
              >
                {rows.map((row) => (
                  <div
                    key={`${date}-${row.task}`}
                    className={`w-full ${TASK_COLORS[row.task] ?? "bg-border"}`}
                    style={{
                      height: `${(row.calls / (dayTotal || 1)) * 100}%`,
                    }}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
