import { Badge, Separator, Skeleton } from "@duyet/components";
import { createFileRoute } from "@tanstack/react-router";
import { Coins, Newspaper, Play, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { AdminPanel } from "../components/system/AdminPanel";
import { BarList } from "../components/system/BarList";
import { ChartCard } from "../components/system/ChartCard";
import {
  CategoryDonut,
  ItemsAreaChart,
  TokensLineChart,
} from "../components/system/DitherCharts";
import { LlmSection } from "../components/system/LlmSection";
import { RankingExplainer } from "../components/system/RankingExplainer";
import { RunDurationBars } from "../components/system/RunDurationBars";
import { RunOutcomeBars } from "../components/system/RunOutcomeBars";
import { RunStatusStrip } from "../components/system/RunStatusStrip";
import { RunsList } from "../components/system/RunsList";
import { StatTile } from "../components/system/StatTile";
import { useAdmin } from "../lib/admin";
import { categoryLabel, statusLabel } from "../lib/lang";
import type { SystemStats } from "../lib/system-queries";
import type { Lang } from "../lib/types";

export const Route = createFileRoute("/data")({
  component: SystemPage,
});

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function DataSkeleton() {
  return (
    <div className="news-content news-data space-y-6 py-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-full max-w-md" />
        <Skeleton className="h-5 w-72" />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-48 rounded-lg" />
        ))}
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="mb-3 font-sans text-xs font-semibold uppercase tracking-wider text-muted-foreground">
      {children}
    </h2>
  );
}

function SystemPage() {
  // English-only by design: the global lang toggle is disabled on this
  // route (see HeaderBar/LangToggle), so this page never renders VI.
  const lang: Lang = "en";
  const t = (en: string, _vi: string) => en;
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [error, setError] = useState(false);
  const admin = useAdmin();

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
      <p className="news-content news-data mx-auto max-w-3xl py-16 text-center text-sm text-muted-foreground">
        {t("Couldn't load system stats.", "Không tải được thống kê hệ thống.")}
      </p>
    );
  }

  if (!stats) {
    return <DataSkeleton />;
  }

  return (
    <div className="news-content news-data py-6">
      <header className="mb-8 space-y-3">
        <div>
          <h1 className="font-sans text-2xl font-semibold tracking-tight text-foreground">
            {t("Pipeline data", "Dữ liệu pipeline")}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {t(
              "Ingestion pipeline, content, and token usage — live from the database.",
              "Pipeline thu thập, nội dung và mức dùng token — trực tiếp từ cơ sở dữ liệu."
            )}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="font-normal">
            <span className="text-muted-foreground">
              {t("Scoring", "Chấm điểm")}
            </span>
            <span className="ml-1.5 font-mono text-foreground">
              {stats.models.scoring[0] ?? "—"}
            </span>
            {stats.models.scoring.length > 1 ? (
              <span className="ml-1 text-muted-foreground">
                +{stats.models.scoring.length - 1}
              </span>
            ) : null}
          </Badge>
          <Badge variant="secondary" className="font-normal">
            <span className="text-muted-foreground">
              {t("Translation", "Dịch")}
            </span>
            <span className="ml-1.5 font-mono text-foreground">
              {stats.models.translation[0] ?? "—"}
            </span>
          </Badge>
          <span className="text-xs text-muted-foreground">
            {t("via", "qua")}{" "}
            <a
              href="https://anyrouter.dev/?ref=news.duyet.net"
              target="_blank"
              rel="noopener"
              className="font-medium text-accent underline underline-offset-2 hover:no-underline"
            >
              AnyRouter
            </a>
          </span>
        </div>
      </header>

      <section className="mb-8">
        <SectionLabel>{t("Overview", "Tổng quan")}</SectionLabel>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile
            icon={Newspaper}
            label={t("Stories", "Bài viết")}
            value={String(stats.totals.items)}
          />
          <StatTile
            icon={Coins}
            label={t("Tokens burned", "Token đã dùng")}
            value={formatTokens(stats.tokens.total)}
            sublabel={t(
              `${stats.tokens.avgPerItem} avg/item`,
              `${stats.tokens.avgPerItem} TB/bài`
            )}
          />
          <StatTile
            icon={Play}
            label={t("Runs today", "Lần chạy hôm nay")}
            value={String(stats.runsToday)}
          />
          <StatTile
            icon={Users}
            label={t("Subscribers", "Người đăng ký")}
            value={String(stats.totals.subscribers)}
          />
        </div>
      </section>

      <section className="mb-8">
        <SectionLabel>{t("Pipeline & LLM", "Pipeline & LLM")}</SectionLabel>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ChartCard
            title={t("Last run", "Lần chạy gần nhất")}
            subtitle={
              stats.lastRun?.started_at
                ? new Date(stats.lastRun.started_at * 1000).toLocaleString(
                    "en-US"
                  )
                : t("No runs recorded", "Chưa ghi nhận lần chạy nào")
            }
            action={
              stats.lastRun ? (
                <Badge
                  variant={stats.lastRun.error ? "destructive" : "secondary"}
                  className={
                    stats.lastRun.error
                      ? ""
                      : "border-transparent bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/10 dark:text-emerald-400"
                  }
                >
                  {stats.lastRun.error
                    ? t("Failed", "Thất bại")
                    : t("Healthy", "Ổn định")}
                </Badge>
              ) : null
            }
          >
            {stats.lastRun ? (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
                <span className="text-muted-foreground">
                  {t("fetched", "lấy về")}{" "}
                  <span className="font-mono tabular-nums text-foreground">
                    {stats.lastRun.items_fetched ?? 0}
                  </span>
                </span>
                <Separator
                  orientation="vertical"
                  className="hidden h-4 sm:block"
                />
                <span className="text-muted-foreground">
                  {t("new", "mới")}{" "}
                  <span className="font-mono tabular-nums text-foreground">
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
            title={t("Items per day", "Bài viết theo ngày")}
            subtitle={t(
              "Published stories, last 14 days",
              "Bài đã đăng, 14 ngày gần nhất"
            )}
          >
            <ItemsAreaChart
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
            <TokensLineChart
              data={stats.tokens.perDay}
              emptyLabel={t("No token data yet.", "Chưa có dữ liệu token.")}
              formatValue={formatTokens}
            />
          </ChartCard>

          <ChartCard
            title="LLM calls"
            subtitle="Calls, failures, and token burn by task (14 days)"
          >
            <LlmSection
              data={stats.llmCallsPerDay}
              formatTokens={formatTokens}
            />
          </ChartCard>

          <ChartCard
            title="Ranking"
            subtitle="How stories are scored for the feed"
            className="md:col-span-2"
          >
            <RankingExplainer models={stats.models} />
          </ChartCard>
        </div>
      </section>

      <section className="mb-8">
        <SectionLabel>
          {t("Content breakdown", "Phân tích nội dung")}
        </SectionLabel>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ChartCard
            title={t("Category share", "Tỷ trọng chuyên mục")}
            subtitle={t(
              "Story share of the top categories",
              "Tỷ lệ bài viết theo chuyên mục hàng đầu"
            )}
          >
            <CategoryDonut
              data={stats.itemsByCategory}
              emptyLabel={t("No data yet.", "Chưa có dữ liệu.")}
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
              data={stats.itemsByStatus.map((s) => ({
                ...s,
                name: statusLabel(s.name, lang),
              }))}
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
            title={t("Content", "Nội dung")}
            subtitle={t(
              "Translations, digests, sources",
              "Bản dịch, bản tóm tắt, nguồn"
            )}
          >
            <dl className="divide-y divide-border">
              {(
                [
                  [t("Translations", "Bản dịch"), stats.totals.translations],
                  [
                    t("AI;DR digests", "Bản tóm tắt"),
                    stats.totals.tldrSnapshots,
                  ],
                  [
                    t("Latest digest date", "Ngày tóm tắt gần nhất"),
                    stats.latestTldrDate ?? "—",
                  ],
                  [
                    t("Configured sources", "Nguồn cấu hình"),
                    stats.totals.sources,
                  ],
                  [
                    t("Key-source citations", "Trích dẫn nguồn phụ"),
                    stats.totals.itemSourcesRows,
                  ],
                ] as const
              ).map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-center justify-between gap-4 py-2 first:pt-0 last:pb-0"
                >
                  <dt className="text-sm text-muted-foreground">{label}</dt>
                  <dd className="font-mono text-sm tabular-nums text-foreground">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </ChartCard>

          <ChartCard
            title={t("Items by category", "Bài viết theo chuyên mục")}
            subtitle={t("Top 10 categories", "10 chuyên mục nhiều nhất")}
            className="md:col-span-2"
          >
            <BarList
              data={stats.itemsByCategory.map((c) => ({
                ...c,
                name: categoryLabel(c.name, lang),
              }))}
              emptyLabel={t("No data yet.", "Chưa có dữ liệu.")}
            />
          </ChartCard>
        </div>
      </section>

      <section className="mb-8">
        <SectionLabel>{t("Run history", "Lịch sử lần chạy")}</SectionLabel>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <ChartCard
            title={t("Run status", "Trạng thái lần chạy")}
            subtitle={t(
              "Outcome per run, oldest to newest",
              "Kết quả từng lần chạy, cũ đến mới"
            )}
          >
            <RunStatusStrip
              runs={stats.runs}
              emptyLabel={t("No runs yet.", "Chưa có lần chạy nào.")}
            />
          </ChartCard>

          <ChartCard
            title={t("Run duration", "Thời lượng lần chạy")}
            subtitle={t(
              "Seconds per run, oldest to newest",
              "Số giây mỗi lần chạy, cũ đến mới"
            )}
          >
            <RunDurationBars
              runs={stats.runs}
              emptyLabel={t("No data yet.", "Chưa có dữ liệu.")}
            />
          </ChartCard>

          <ChartCard
            title={t("Run outcomes", "Kết quả lần chạy")}
            subtitle={t(
              "New / merged / rejected items per run",
              "Bài mới / gộp / loại theo lần chạy"
            )}
            className="md:col-span-2"
          >
            <RunOutcomeBars
              runs={stats.runs}
              emptyLabel={t("No data yet.", "Chưa có dữ liệu.")}
            />
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
      </section>

      {admin.isAdmin ? (
        <section>
          <SectionLabel>Admin</SectionLabel>
          <AdminPanel admin={admin} />
        </section>
      ) : null}
    </div>
  );
}
