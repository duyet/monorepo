import {
  Badge,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@duyet/components";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Fragment, useState } from "react";
import { anyrouterModelUrl } from "../../lib/anyrouter";
import { timeAgo } from "../../lib/lang";
import type {
  LlmCallRow,
  RunLlmSummary,
  WorkflowRunRow,
  WorkflowRunStats,
} from "../../lib/system-queries";
import { useHorizontalScroll } from "../../lib/use-horizontal-scroll";

interface RunsListProps {
  runs: WorkflowRunRow[];
  lang: "en" | "vi";
}

function formatDurationSec(
  started: number | null,
  finished: number | null
): number {
  if (!started || !finished) return 0;
  return Math.max(finished - started, 0);
}

function formatDuration(
  started: number | null,
  finished: number | null
): string {
  const s = formatDurationSec(started, finished);
  if (!s) return "—";
  return s < 60 ? `${s}s` : `${Math.round(s / 60)}m`;
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function formatMs(ms: number): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  const s = ms / 1000;
  if (s < 60) return `${s < 10 ? s.toFixed(1) : Math.round(s)}s`;
  return `${Math.round(s / 60)}m`;
}

function shortModel(model: string): string {
  // anyrouter/auto → auto; provider/org/model-name → model-name
  const parts = model.split("/");
  return parts[parts.length - 1] || model;
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

function statusVariant(
  ok: boolean,
  partial: boolean
): "default" | "secondary" | "destructive" | "outline" {
  if (!ok) return "destructive";
  if (partial) return "outline";
  return "secondary";
}

function llmTokens(
  stats: WorkflowRunStats | null,
  llm?: RunLlmSummary
): number {
  if (llm && llm.tokens > 0) return llm.tokens;
  return stats?.tokens ?? 0;
}

function ModelsCell({ llm }: { llm?: RunLlmSummary }) {
  if (!llm || llm.models.length === 0) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const chainTitle = llm.models.join(" → ");
  return (
    <div className="min-w-0 max-w-[16rem]">
      <div
        className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 font-mono text-xs text-foreground"
        title={chainTitle}
      >
        {llm.models.map((model, i) => (
          <span
            key={`${model}-${i}`}
            className="inline-flex min-w-0 items-center gap-1"
          >
            {i > 0 ? (
              <span className="shrink-0 text-muted-foreground" aria-hidden>
                →
              </span>
            ) : null}
            <a
              href={anyrouterModelUrl(model)}
              target="_blank"
              rel="noopener noreferrer"
              className="truncate underline-offset-2 hover:text-accent hover:underline"
              onClick={(e) => e.stopPropagation()}
            >
              {shortModel(model)}
            </a>
          </span>
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground">
        {llm.calls} call{llm.calls === 1 ? "" : "s"}
        {llm.failures > 0 ? ` · ${llm.failures} fail` : ""}
        {llm.models.length > 1 ? " · fallback" : ""}
      </span>
    </div>
  );
}

function AttemptRows({ attempts }: { attempts: LlmCallRow[] }) {
  if (attempts.length === 0) {
    return <p className="text-xs text-muted-foreground">No LLM call detail.</p>;
  }
  return (
    <div className="overflow-x-auto rounded-md border border-border bg-muted/30">
      <table className="w-full min-w-[640px] text-left text-xs">
        <thead>
          <tr className="border-b border-border text-muted-foreground">
            <th className="px-2 py-1.5 font-medium">Task</th>
            <th className="px-2 py-1.5 font-medium">Model</th>
            <th className="px-2 py-1.5 font-medium">OK</th>
            <th className="px-2 py-1.5 text-right font-medium">Tokens</th>
            <th className="px-2 py-1.5 text-right font-medium">Prompt</th>
            <th className="px-2 py-1.5 text-right font-medium">Out</th>
            <th className="px-2 py-1.5 text-right font-medium">Cached</th>
            <th className="px-2 py-1.5 text-right font-medium">Time</th>
            <th className="px-2 py-1.5 font-medium">Error</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((call, i) => (
            <tr
              key={`${call.ts}-${call.model}-${i}`}
              className="border-b border-border/60 last:border-0"
            >
              <td className="px-2 py-1.5">
                <Badge variant="outline" className="text-[10px] font-normal">
                  {call.task}
                </Badge>
              </td>
              <td className="max-w-[12rem] truncate px-2 py-1.5 font-mono text-[11px]">
                <a
                  href={anyrouterModelUrl(call.model)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground underline-offset-2 hover:text-accent hover:underline"
                  title={call.model}
                >
                  {call.model}
                </a>
              </td>
              <td className="px-2 py-1.5">
                <Badge
                  variant={call.ok ? "secondary" : "destructive"}
                  className={`text-[10px] ${
                    call.ok
                      ? "border-transparent bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                      : ""
                  }`}
                >
                  {call.ok ? "ok" : "fail"}
                </Badge>
              </td>
              <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                {call.tokens ? formatTokens(call.tokens) : "—"}
              </td>
              <td className="px-2 py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                {call.promptTokens != null
                  ? formatTokens(call.promptTokens)
                  : "—"}
              </td>
              <td className="px-2 py-1.5 text-right font-mono tabular-nums text-muted-foreground">
                {call.completionTokens != null
                  ? formatTokens(call.completionTokens)
                  : "—"}
              </td>
              <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                {call.cachedTokens != null && call.cachedTokens > 0 ? (
                  <span className="text-emerald-700 dark:text-emerald-400">
                    {formatTokens(call.cachedTokens)}
                  </span>
                ) : call.cachedTokens === 0 ? (
                  "0"
                ) : (
                  "—"
                )}
              </td>
              <td className="px-2 py-1.5 text-right font-mono tabular-nums">
                {formatMs(call.durationMs)}
              </td>
              <td
                className="max-w-[10rem] truncate px-2 py-1.5 text-muted-foreground"
                title={call.error ?? undefined}
              >
                {call.error ?? "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function RunsList({ runs, lang }: RunsListProps) {
  const scrollRef = useHorizontalScroll<HTMLDivElement>();
  const [openId, setOpenId] = useState<string | null>(null);

  if (runs.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        {lang === "vi" ? "Chưa có lần chạy nào." : "No runs yet."}
      </p>
    );
  }

  const maxDuration = Math.max(
    ...runs.map((r) => formatDurationSec(r.started_at, r.finished_at)),
    1
  );

  return (
    <div
      ref={scrollRef}
      className="scrollbar-hide -mx-1 overflow-x-auto rounded-md border border-border"
    >
      <Table className="min-w-[960px]">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="h-9 w-8 px-2" />
            <TableHead className="h-9 px-3 text-xs font-medium">
              {lang === "vi" ? "Trạng thái" : "Status"}
            </TableHead>
            <TableHead className="h-9 px-3 text-xs font-medium">
              {lang === "vi" ? "Bắt đầu" : "Started"}
            </TableHead>
            <TableHead className="h-9 px-3 text-right text-xs font-medium">
              {lang === "vi" ? "Thời lượng" : "Duration"}
            </TableHead>
            <TableHead className="h-9 px-3 text-xs font-medium">
              Model
            </TableHead>
            <TableHead className="h-9 px-3 text-right text-xs font-medium">
              Tokens
            </TableHead>
            <TableHead className="h-9 px-3 text-right text-xs font-medium">
              Cached
            </TableHead>
            <TableHead className="h-9 px-3 text-right text-xs font-medium">
              LLM time
            </TableHead>
            <TableHead className="h-9 px-3 text-right text-xs font-medium">
              {lang === "vi" ? "Lấy về" : "Fetched"}
            </TableHead>
            <TableHead className="h-9 px-3 text-right text-xs font-medium">
              {lang === "vi" ? "Mới/Gộp/Loại" : "New/Merged/Rej"}
            </TableHead>
            <TableHead className="h-9 px-3 text-xs font-medium">
              {lang === "vi" ? "Khác" : "Extras"}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {runs.map((r) => {
            const ok = !r.error;
            const partial = ok && (r.items_fetched ?? 0) === 0;
            const stats = r.stats;
            const llm = r.llm;
            const sourceLine = stats ? bySourceSubline(stats) : null;
            const badges = stats ? extraBadges(stats, lang) : [];
            const sec = formatDurationSec(r.started_at, r.finished_at);
            const pct = sec ? Math.max((sec / maxDuration) * 100, 4) : 0;
            const tokens = llmTokens(stats, llm);
            const expanded = openId === r.id;
            const canExpand = Boolean(llm?.attempts.length);
            return (
              <Fragment key={r.id}>
                <TableRow
                  className={canExpand ? "cursor-pointer" : undefined}
                  onClick={() => {
                    if (!canExpand) return;
                    setOpenId(expanded ? null : r.id);
                  }}
                >
                  <TableCell className="px-2 py-2 text-muted-foreground">
                    {canExpand ? (
                      expanded ? (
                        <ChevronDown className="h-3.5 w-3.5" aria-hidden />
                      ) : (
                        <ChevronRight className="h-3.5 w-3.5" aria-hidden />
                      )
                    ) : null}
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <Badge
                      variant={statusVariant(ok, partial)}
                      className={`whitespace-nowrap text-[10px] font-medium ${
                        ok && !partial
                          ? "border-transparent bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                          : partial
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400"
                            : ""
                      }`}
                      title={!ok ? (r.error ?? undefined) : undefined}
                    >
                      {!ok
                        ? lang === "vi"
                          ? "lỗi"
                          : "error"
                        : partial
                          ? lang === "vi"
                            ? "trống"
                            : "empty"
                          : "OK"}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className="px-3 py-2 font-mono text-xs tabular-nums text-foreground"
                    title={
                      r.started_at
                        ? new Date(r.started_at * 1000).toLocaleString()
                        : undefined
                    }
                  >
                    {r.started_at
                      ? timeAgo(r.started_at, Date.now(), lang)
                      : "—"}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right">
                    <div className="font-mono text-xs tabular-nums text-foreground">
                      {formatDuration(r.started_at, r.finished_at)}
                    </div>
                    {sec ? (
                      <div
                        className="ml-auto mt-1 h-1 rounded-full bg-accent"
                        style={{ width: `${pct}%`, maxWidth: "3.5rem" }}
                        title={`${sec}s`}
                      />
                    ) : null}
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    <ModelsCell llm={llm} />
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right font-mono text-xs tabular-nums text-foreground">
                    {tokens ? formatTokens(tokens) : "—"}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right font-mono text-xs tabular-nums">
                    {llm && llm.cachedTokens > 0 ? (
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {formatTokens(llm.cachedTokens)}
                      </span>
                    ) : llm ? (
                      <span className="text-muted-foreground">0</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right font-mono text-xs tabular-nums text-foreground">
                    {llm ? formatMs(llm.durationMs) : "—"}
                  </TableCell>
                  <TableCell className="px-3 py-2 text-right font-mono text-xs tabular-nums text-foreground">
                    <div>{r.items_fetched ?? 0}</div>
                    {sourceLine ? (
                      <div
                        className="font-sans text-[10px] font-normal text-muted-foreground"
                        title={sourceLine}
                      >
                        {sourceLine}
                      </div>
                    ) : null}
                  </TableCell>
                  <TableCell
                    className="px-3 py-2 text-right font-mono text-xs tabular-nums text-foreground"
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
                  </TableCell>
                  <TableCell className="px-3 py-2">
                    {badges.length > 0 ? (
                      <span className="flex flex-wrap gap-1">
                        {badges.map((b) => (
                          <Badge
                            key={b.label}
                            variant="outline"
                            className="whitespace-nowrap px-1.5 py-0 text-[10px] font-normal text-muted-foreground"
                          >
                            {b.label}
                            {b.value > 1 ? ` ${b.value}` : ""}
                          </Badge>
                        ))}
                      </span>
                    ) : null}
                  </TableCell>
                </TableRow>
                {expanded && llm ? (
                  <TableRow className="hover:bg-transparent">
                    <TableCell colSpan={11} className="bg-muted/20 px-3 py-3">
                      <AttemptRows attempts={llm.attempts} />
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
