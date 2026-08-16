import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BarList } from "../components/system/BarList";
import { ChartCard } from "../components/system/ChartCard";
import { DailyBars } from "../components/system/DailyBars";
import { RunsList } from "../components/system/RunsList";
import { StatTile } from "../components/system/StatTile";
import { useLang } from "../lib/lang-context";
import type { SystemStats } from "../lib/system-queries";

export const Route = createFileRoute("/system")({
  component: SystemPage,
});

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function SystemPage() {
  const lang = useLang();
  const t = (en: string, vi: string) => (lang === "vi" ? vi : en);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [error, setError] = useState(false);

  // Static shell — stats are bound client-side from /api/system.
  useEffect(() => {
    let cancelled = false;
    fetch("/api/system")
      .then((res) => (res.ok ? (res.json() as Promise<SystemStats>) : null))
      .then((res) => {
        if (cancelled) return;
        if (res) setStats(res);
        else setError(true);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <p className="news-content mx-auto max-w-3xl py-16 text-center text-muted-foreground">
        {t("Couldn't load system stats.", "Không tải được thống kê hệ thống.")}
      </p>
    );
  }

  if (!stats) {
    return (
      <div className="news-content mx-auto max-w-3xl animate-pulse space-y-3 py-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i} className="h-16 rounded bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="news-content mx-auto max-w-3xl py-6">
      <header className="mb-6">
        <h1 className="text-lg font-semibold text-foreground">
          {t("System status", "Trạng thái hệ thống")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            "Ingestion pipeline, content, and token usage — live from the database.",
            "Pipeline thu thập, nội dung và mức dùng token — trực tiếp từ cơ sở dữ liệu."
          )}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          {t("Scoring", "Chấm điểm")}:{" "}
          <span className="font-mono text-foreground">
            {stats.models.scoring[0] ?? "—"}
          </span>
          {stats.models.scoring.length > 1 &&
            ` (+${stats.models.scoring.length - 1} ${t("fallback", "dự phòng")})`}
          {" · "}
          {t("Translation", "Dịch")}:{" "}
          <span className="font-mono text-foreground">
            {stats.models.translation[0] ?? "—"}
          </span>
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile
          label={t("Stories", "Bài viết")}
          value={String(stats.totals.items)}
        />
        <StatTile
          label={t("Tokens burned", "Token đã dùng")}
          value={formatTokens(stats.tokens.total)}
          sublabel={t(
            `${stats.tokens.avgPerItem} avg/item`,
            `${stats.tokens.avgPerItem} TB/bài`
          )}
        />
        <StatTile
          label={t("Runs today", "Lần chạy hôm nay")}
          value={String(stats.runsToday)}
        />
        <StatTile
          label={t("Subscribers", "Người đăng ký")}
          value={String(stats.totals.subscribers)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
        <ChartCard
          title={t("Last run", "Lần chạy gần nhất")}
          subtitle={
            stats.lastRun?.started_at
              ? new Date(stats.lastRun.started_at * 1000).toLocaleString()
              : t("No runs recorded", "Chưa ghi nhận lần chạy nào")
          }
        >
          {stats.lastRun ? (
            <div className="flex items-center gap-4 text-sm">
              <span
                className={`inline-flex items-center gap-1.5 font-medium ${
                  stats.lastRun.error ? "text-red-500" : "text-emerald-500"
                }`}
              >
                <span
                  className={`inline-block h-2 w-2 rounded-full ${
                    stats.lastRun.error ? "bg-red-500" : "bg-emerald-500"
                  }`}
                />
                {stats.lastRun.error
                  ? t("Failed", "Thất bại")
                  : t("Healthy", "Ổn định")}
              </span>
              <span className="text-muted-foreground">
                {t("fetched", "lấy về")}{" "}
                <span className="font-mono text-foreground">
                  {stats.lastRun.items_fetched ?? 0}
                </span>
                {" · "}
                {t("new", "mới")}{" "}
                <span className="font-mono text-foreground">
                  {stats.lastRun.items_new ?? 0}
                </span>
              </span>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("No data yet.", "Chưa có dữ liệu.")}
            </p>
          )}
        </ChartCard>

        <ChartCard
          title={t("Analytics & traffic", "Phân tích & lưu lượng")}
          subtitle={t(
            "No server-side traffic store in D1",
            "Không lưu lưu lượng phía server trong D1"
          )}
        >
          <p className="text-sm text-muted-foreground">
            {t(
              "Page-view analytics run client-side (see the site's Analytics component). For request-level traffic, latency, and error rates, use the ",
              "Số liệu lượt xem chạy phía client (xem component Analytics của trang). Với lưu lượng, độ trễ, tỷ lệ lỗi ở tầng request, xem "
            )}
            <a
              href="https://dash.cloudflare.com/?to=/:account/workers/services/view/news/production/metrics"
              target="_blank"
              rel="noreferrer"
              className="text-accent underline underline-offset-2"
            >
              Cloudflare Workers dashboard
            </a>
            .
          </p>
        </ChartCard>

        <ChartCard
          title={t("Items per day", "Bài viết theo ngày")}
          subtitle={t(
            "Published stories, last 14 days",
            "Bài đã đăng, 14 ngày gần nhất"
          )}
        >
          <DailyBars
            data={stats.itemsPerDay}
            emptyLabel={t("No data yet.", "Chưa có dữ liệu.")}
          />
        </ChartCard>

        <ChartCard
          title={t("Tokens per day", "Token theo ngày")}
          subtitle={t(
            "LLM tokens spent, last 14 days",
            "Token LLM đã dùng, 14 ngày gần nhất"
          )}
        >
          <DailyBars
            data={stats.tokens.perDay}
            emptyLabel={t("No token data yet.", "Chưa có dữ liệu token.")}
            formatValue={formatTokens}
          />
        </ChartCard>

        <ChartCard
          title={t("Items by status", "Bài viết theo trạng thái")}
          subtitle={t(
            "Pipeline outcome per story",
            "Kết quả xử lý theo từng bài"
          )}
        >
          <BarList
            data={stats.itemsByStatus}
            emptyLabel={t("No data yet.", "Chưa có dữ liệu.")}
          />
        </ChartCard>

        <ChartCard
          title={t("Items by source", "Bài viết theo nguồn")}
          subtitle={t(
            "Top 10 sources by story count",
            "10 nguồn nhiều bài nhất"
          )}
        >
          <BarList
            data={stats.itemsBySource}
            emptyLabel={t("No data yet.", "Chưa có dữ liệu.")}
          />
        </ChartCard>

        <ChartCard
          title={t("Items by category", "Bài viết theo chuyên mục")}
          subtitle={t("Top 10 categories", "10 chuyên mục nhiều nhất")}
          className="md:col-span-2"
        >
          <BarList
            data={stats.itemsByCategory}
            emptyLabel={t("No data yet.", "Chưa có dữ liệu.")}
          />
        </ChartCard>

        <ChartCard
          title={t("Content", "Nội dung")}
          subtitle={t(
            "Translations, digests, sources",
            "Bản dịch, bản tóm tắt, nguồn"
          )}
        >
          <ul className="flex flex-col gap-1.5 text-sm">
            <li className="flex justify-between">
              <span className="text-muted-foreground">
                {t("Translations", "Bản dịch")}
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {stats.totals.translations}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">
                {t("TL;DR digests", "Bản tóm tắt")}
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {stats.totals.tldrSnapshots}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">
                {t("Latest digest date", "Ngày tóm tắt gần nhất")}
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {stats.latestTldrDate ?? "—"}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">
                {t("Configured sources", "Nguồn cấu hình")}
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {stats.totals.sources}
              </span>
            </li>
            <li className="flex justify-between">
              <span className="text-muted-foreground">
                {t("Key-source citations", "Trích dẫn nguồn phụ")}
              </span>
              <span className="font-mono tabular-nums text-foreground">
                {stats.totals.itemSourcesRows}
              </span>
            </li>
          </ul>
        </ChartCard>

        <ChartCard
          title={t("Recent runs", "Các lần chạy gần đây")}
          subtitle={t(
            "Last 30 ingestion workflow runs",
            "30 lần chạy pipeline gần nhất"
          )}
          className="md:col-span-2"
        >
          <RunsList runs={stats.runs} lang={lang} />
        </ChartCard>
      </div>
    </div>
  );
}
