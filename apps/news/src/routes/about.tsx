import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ExternalLink } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchSourceNames } from "../lib/sources-fn";
import type { SystemStats } from "../lib/system-queries";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [{ title: "About | AI News" }],
  }),
  component: AboutPage,
});

interface Step {
  en: string;
  vi: string;
  subEn: string;
  subVi: string;
}

const STEPS: Step[] = [
  {
    en: "Sources",
    vi: "Nguồn",
    subEn: "HN, HuggingNews, submissions",
    subVi: "HN, HuggingNews, bài gửi từ người dùng",
  },
  {
    en: "Fetch",
    vi: "Thu thập",
    subEn: "hourly poll",
    subVi: "quét mỗi giờ",
  },
  {
    en: "Score",
    vi: "AI chấm điểm",
    subEn: "hides irrelevant stories",
    subVi: "ẩn tin không liên quan",
  },
  {
    en: "Merge",
    vi: "Gộp tin trùng",
    subEn: "same story, one item",
    subVi: "cùng một tin, một mục",
  },
  {
    en: "Translate",
    vi: "Dịch tự nhiên",
    subEn: "EN → VI, journalist style",
    subVi: "Anh → Việt, văn phong báo chí",
  },
  {
    en: "Rank",
    vi: "Xếp hạng",
    subEn: "importance × quality, fresher wins",
    subVi: "tầm quan trọng × chất lượng, mới hơn thắng",
  },
  {
    en: "AI;DR + Email",
    vi: "AI;DR + Email",
    subEn: "daily digest",
    subVi: "bản tin hằng ngày",
  },
];

function PipelineDiagram() {
  // English-only by design: the global lang toggle is disabled on this
  // route (see HeaderBar/LangToggle).
  return (
    <div className="-mx-1 flex flex-wrap items-stretch gap-1 gap-y-2 px-1 py-1">
      {STEPS.map((step, i) => (
        <div key={step.en} className="flex shrink-0 items-stretch">
          <div className="flex w-28 flex-col justify-center rounded-lg border border-border px-2 py-2 text-center">
            <div className="text-sm font-bold text-foreground">{step.en}</div>
            <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
              {step.subEn}
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex shrink-0 items-center px-1">
              <ArrowRight
                className="h-3.5 w-3.5 shrink-0 text-accent"
                aria-hidden
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id?: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-6 scroll-mt-20">
      <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
        {title}
      </h2>
      <div className="mt-2 space-y-1.5 text-sm text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

function Sources() {
  // English-only by design: the global lang toggle is disabled on this
  // route (see HeaderBar/LangToggle).
  const [names, setNames] = useState<string[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchSourceNames()
      .then((res) => {
        if (!cancelled) setNames(res);
      })
      .catch(() => {
        if (!cancelled) setNames([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Section title="Sources">
      {names === null ? (
        <p>Loading...</p>
      ) : names.length === 0 ? (
        <p>No sources configured yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2">
          {names.map((name) => (
            <li
              key={name}
              className="rounded-full border border-border px-3 py-0.5 text-xs text-foreground"
            >
              {name}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function ModelsLine() {
  // English-only by design: the global lang toggle is disabled on this
  // route (see HeaderBar/LangToggle).
  const [stats, setStats] = useState<SystemStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/system")
      .then((res) => (res.ok ? (res.json() as Promise<SystemStats>) : null))
      .then((res) => {
        if (!cancelled && res) setStats(res);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  if (!stats || stats.models.scoring.length === 0) return null;
  const extra = stats.models.scoring.length - 1;

  return (
    <>
      <p>
        Scoring:{" "}
        <span className="font-mono text-foreground">
          {stats.models.scoring[0]}
        </span>
        {extra > 0 && ` (+${extra} fallback)`}
        {" · "}
        Translation:{" "}
        <span className="font-mono text-foreground">
          {stats.models.translation[0]}
        </span>
      </p>
      <p className="text-muted-foreground">
        {"LLM routing via "}
        <a
          href="https://anyrouter.dev/?ref=news.duyet.net"
          target="_blank"
          rel="noopener"
          className="text-accent underline underline-offset-2 hover:no-underline"
        >
          AnyRouter
        </a>
        .
      </p>
    </>
  );
}

function AboutPage() {
  // English-only by design: the global lang toggle is disabled on this
  // route (see HeaderBar/LangToggle).
  const t = (en: string, _vi: string) => en;

  return (
    <div className="py-8">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("About AI News", "Giới thiệu AI News")}
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        {t(
          "AI News is an LLM-based system: AI stories are fetched hourly, scored, merged, ranked, and translated to Vietnamese — every story links back to its original source.",
          "AI News là hệ thống tin tức vận hành bởi LLM: tin về AI được thu thập mỗi giờ, chấm điểm, gộp, xếp hạng và dịch sang tiếng Việt — mỗi tin đều dẫn về nguồn gốc."
        )}
      </p>

      <section id="how-it-works" className="mt-6 scroll-mt-20">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("How it works", "Cách hoạt động")}
        </h2>
        <div className="mt-3">
          <PipelineDiagram />
        </div>
      </section>

      <Sources />

      <Section title={t("Transparency", "Minh bạch")}>
        <ModelsLine />
        <p>
          {t("Pipeline stats at", "Thống kê pipeline tại")}{" "}
          <Link
            to="/data"
            className="text-accent underline underline-offset-2 hover:no-underline"
          >
            /data
          </Link>
          {" · "}
          {t("API at", "API tại")}{" "}
          <Link
            to="/mcp"
            className="text-accent underline underline-offset-2 hover:no-underline"
          >
            /mcp
          </Link>
          {" · "}
          <a
            href="https://github.com/duyet/monorepo/tree/master/apps/news"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent underline underline-offset-2 hover:no-underline"
          >
            GitHub
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
          {" · "}
          <a
            href="https://github.com/duyet/monorepo/blob/master/apps/news/ALGORITHM.md"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-accent underline underline-offset-2 hover:no-underline"
          >
            ALGORITHM.md
            <ExternalLink className="h-3 w-3" aria-hidden />
          </a>
        </p>
      </Section>

      <Section title={t("A note on accuracy", "Lưu ý về độ chính xác")}>
        <p>
          {t(
            'Stories are machine-curated and machine-translated — mistakes are possible. Translation suggestions are welcome from any signed-in reader (see "Suggest better translation" under a story\'s Vietnamese summary).',
            'Tin được máy tuyển chọn và dịch tự động — sai sót có thể xảy ra. Mọi độc giả đã đăng nhập đều có thể góp ý bản dịch (xem mục "Góp ý bản dịch" dưới phần tóm tắt tiếng Việt).'
          )}
        </p>
      </Section>
    </div>
  );
}
