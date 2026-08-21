import { timeAgo } from "../../lib/lang";
import type {
  WorkflowRunRow,
  WorkflowRunStats,
} from "../../lib/system-queries";
import { useHorizontalScroll } from "../../lib/use-horizontal-scroll";

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

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function bySourceSubline(stats: WorkflowRunStats): string | null {
  const entries = Object.entries(stats.bySource ?? {}).filter(([, n]) => n > 0);
  if (entries.length === 0) return null;
  return entries.map(([source, n]) => `${source} ${n}`).join(" · ");
}

interface ExtraBadge {
  label: string;
  value: number;
}

function extraBadges(stats: WorkflowRunStats, lang: "en" | "vi"): ExtraBadge[] {
  const defs: [keyof WorkflowRunStats, string, string][] = [
    ["backfilledSummaries", "backfill sum", "backfill tóm tắt"],
    ["backfilledTranslations", "backfill vi", "backfill dịch"],
    ["qaRated", "QA", "QA"],
    ["qaAdjusted", "QA adj", "QA sửa"],
    ["suggestionsReviewed", "suggestions", "góp ý"],
    ["submissionsReviewed", "submissions", "bài gửi"],
    ["emailsSent", "emails", "email"],
  ];
  const badges: ExtraBadge[] = [];
  for (const [key, en, vi] of defs) {
    const value = stats[key];
    if (typeof value === "number" && value > 0) {
      badges.push({ label: lang === "vi" ? vi : en, value });
    }
  }
  if (stats.tldrGenerated) {
    badges.push({ label: "AI;DR", value: 1 });
  }
  return badges;
}

export function RunsList({ runs, lang }: RunsListProps) {
  const scrollRef = useHorizontalScroll<HTMLDivElement>();

  if (runs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {lang === "vi" ? "Chưa có lần chạy nào." : "No runs yet."}
      </p>
    );
  }
  return (
    <div
      ref={scrollRef}
      className="scrollbar-hide overflow-x-auto rounded-lg border border-border"
    >
      <table className="w-full min-w-[720px] text-left text-xs">
        <thead>
          <tr className="border-border border-b text-muted-foreground">
            <th className="px-3 py-2 font-normal">
              {lang === "vi" ? "Trạng thái" : "Status"}
            </th>
            <th className="px-3 py-2 font-normal">
              {lang === "vi" ? "Bắt đầu" : "Started"}
            </th>
            <th className="px-3 py-2 text-right font-normal">
              {lang === "vi" ? "Thời lượng" : "Duration"}
            </th>
            <th className="px-3 py-2 text-right font-normal">
              {lang === "vi" ? "Lấy về" : "Fetched"}
            </th>
            <th className="px-3 py-2 text-right font-normal">
              {lang === "vi" ? "Mới/Gộp/Loại" : "New/Merged/Rej"}
            </th>
            <th className="px-3 py-2 text-right font-normal">
              {lang === "vi" ? "Token" : "Tokens"}
            </th>
            <th className="px-3 py-2 font-normal">
              {lang === "vi" ? "Khác" : "Extras"}
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {runs.map((r) => {
            const ok = !r.error;
            const partial = ok && (r.items_fetched ?? 0) === 0;
            const stats = r.stats;
            const sourceLine = stats ? bySourceSubline(stats) : null;
            const badges = stats ? extraBadges(stats, lang) : [];
            return (
              <tr key={r.id} className="hover:bg-muted/50">
                <td className="px-3 py-2">
                  <span
                    className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
                      !ok
                        ? "bg-red-500/10 text-red-600 dark:text-red-400"
                        : partial
                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                          : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {!ok
                      ? (r.error ?? (lang === "vi" ? "lỗi" : "error"))
                      : partial
                        ? lang === "vi"
                          ? "trống"
                          : "empty"
                        : "OK"}
                  </span>
                </td>
                <td
                  className="px-3 py-2 font-mono tabular-nums text-foreground"
                  title={
                    r.started_at
                      ? new Date(r.started_at * 1000).toLocaleString()
                      : undefined
                  }
                >
                  {r.started_at ? timeAgo(r.started_at, Date.now(), lang) : "—"}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                  {formatDuration(r.started_at, r.finished_at)}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                  <div>{r.items_fetched ?? 0}</div>
                  {sourceLine && (
                    <div
                      className="font-sans text-[10px] font-normal text-muted-foreground"
                      title={sourceLine}
                    >
                      {sourceLine}
                    </div>
                  )}
                </td>
                <td
                  className="px-3 py-2 text-right font-mono tabular-nums text-foreground"
                  title={
                    stats
                      ? `${lang === "vi" ? "Mới" : "New"} ${stats.new ?? 0} · ${
                          lang === "vi" ? "Gộp" : "Merged"
                        } ${stats.merged ?? 0} · ${
                          lang === "vi" ? "Loại" : "Rejected"
                        } ${stats.rejected ?? 0}`
                      : undefined
                  }
                >
                  {stats
                    ? `+${stats.new ?? 0} ~${stats.merged ?? 0} −${
                        stats.rejected ?? 0
                      }`
                    : (r.items_new ?? 0)}
                </td>
                <td className="px-3 py-2 text-right font-mono tabular-nums text-foreground">
                  {stats?.tokens ? formatTokens(stats.tokens) : "—"}
                </td>
                <td className="px-3 py-2">
                  {badges.length > 0 && (
                    <span className="flex flex-wrap gap-1">
                      {badges.map((b) => (
                        <span
                          key={b.label}
                          className="whitespace-nowrap rounded-full border border-border px-1.5 py-0 text-[10px] text-muted-foreground"
                        >
                          {b.label}
                          {b.value > 1 ? ` ${b.value}` : ""}
                        </span>
                      ))}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
