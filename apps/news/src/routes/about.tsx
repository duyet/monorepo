import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { useLang } from "../lib/lang-context";
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
    en: "TL;DR + Email",
    vi: "TL;DR + Email",
    subEn: "daily digest",
    subVi: "bản tin hằng ngày",
  },
];

function PipelineDiagram() {
  const lang = useLang();
  return (
    <div className="scrollbar-hide -mx-1 flex items-stretch gap-1 overflow-x-auto px-1 py-1">
      {STEPS.map((step, i) => (
        <div key={step.en} className="flex shrink-0 items-stretch">
          <div className="flex w-32 flex-col justify-center rounded-lg border border-border px-3 py-2.5 text-center">
            <div className="text-sm font-bold text-foreground">
              {lang === "vi" ? step.vi : step.en}
            </div>
            <div className="mt-0.5 text-[11px] leading-tight text-muted-foreground">
              {lang === "vi" ? step.subVi : step.subEn}
            </div>
          </div>
          {i < STEPS.length - 1 && (
            <div className="flex shrink-0 items-center px-1.5">
              <ArrowRight className="h-4 w-4 text-accent" aria-hidden />
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
  const lang = useLang();
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
    <Section title={lang === "vi" ? "Nguồn tin" : "Sources"}>
      {names === null ? (
        <p>{lang === "vi" ? "Đang tải..." : "Loading..."}</p>
      ) : names.length === 0 ? (
        <p>
          {lang === "vi" ? "Chưa có nguồn nào." : "No sources configured yet."}
        </p>
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
  const lang = useLang();
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
    <p>
      {lang === "vi" ? "Chấm điểm" : "Scoring"}:{" "}
      <span className="font-mono text-foreground">
        {stats.models.scoring[0]}
      </span>
      {extra > 0 && ` (+${extra} ${lang === "vi" ? "dự phòng" : "fallback"})`}
      {" · "}
      {lang === "vi" ? "Dịch" : "Translation"}:{" "}
      <span className="font-mono text-foreground">
        {stats.models.translation[0]}
      </span>
    </p>
  );
}

function AboutPage() {
  const lang = useLang();
  const t = (en: string, vi: string) => (lang === "vi" ? vi : en);

  return (
    <div className="mx-auto max-w-2xl py-8">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("About AI News", "Giới thiệu AI News")}
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
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
            to="/system"
            className="text-accent underline underline-offset-2 hover:no-underline"
          >
            /system
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
            className="text-accent underline underline-offset-2 hover:no-underline"
          >
            GitHub
          </a>
          {" · "}
          <a
            href="https://github.com/duyet/monorepo/blob/master/apps/news/ALGORITHM.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-accent underline underline-offset-2 hover:no-underline"
          >
            ALGORITHM.md
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
