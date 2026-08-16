import type { WorkflowRunRow } from "../../lib/system-fn";

interface RunsListProps {
  runs: WorkflowRunRow[];
  lang: "en" | "vi";
}

function formatDuration(
  started: number | null,
  finished: number | null
): string {
  if (!started || !finished) return "—";
  const s = Math.max(finished - started, 0);
  return s < 60 ? `${s}s` : `${Math.round(s / 60)}m`;
}

export function RunsList({ runs, lang }: RunsListProps) {
  if (runs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {lang === "vi" ? "Chưa có lần chạy nào." : "No runs yet."}
      </p>
    );
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead>
          <tr className="text-muted-foreground">
            <th className="pb-2 font-normal">
              {lang === "vi" ? "Trạng thái" : "Status"}
            </th>
            <th className="pb-2 font-normal">
              {lang === "vi" ? "Bắt đầu" : "Started"}
            </th>
            <th className="pb-2 font-normal">
              {lang === "vi" ? "Thời lượng" : "Duration"}
            </th>
            <th className="pb-2 text-right font-normal">
              {lang === "vi" ? "Lấy về" : "Fetched"}
            </th>
            <th className="pb-2 text-right font-normal">
              {lang === "vi" ? "Mới" : "New"}
            </th>
          </tr>
        </thead>
        <tbody>
          {runs.map((r) => {
            const ok = !r.error;
            return (
              <tr key={r.id} className="border-t border-border">
                <td className="py-1.5">
                  <span className="flex items-center gap-1.5">
                    <span
                      className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
                        ok ? "bg-emerald-500" : "bg-red-500"
                      }`}
                    />
                    <span
                      className={ok ? "text-muted-foreground" : "text-red-500"}
                    >
                      {ok ? "OK" : (r.error ?? "error")}
                    </span>
                  </span>
                </td>
                <td className="py-1.5 font-mono tabular-nums text-foreground">
                  {r.started_at
                    ? new Date(r.started_at * 1000).toLocaleString()
                    : "—"}
                </td>
                <td className="py-1.5 font-mono tabular-nums text-foreground">
                  {formatDuration(r.started_at, r.finished_at)}
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums text-foreground">
                  {r.items_fetched ?? 0}
                </td>
                <td className="py-1.5 text-right font-mono tabular-nums text-foreground">
                  {r.items_new ?? 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
