import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useLang } from "../lib/lang-context";
import { fetchSourceNames } from "../lib/sources-fn";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [{ title: "About | AI News" }],
  }),
  component: AboutPage,
});

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-8">
      <h2 className="text-lg font-bold tracking-wide">{title}</h2>
      <div className="mt-2 space-y-2 text-sm text-muted-foreground">
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
      <p>
        {lang === "vi"
          ? "Hiện tại bảng tin lấy từ:"
          : "Right now the feed pulls from:"}
      </p>
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
      <p>
        {lang === "vi"
          ? "Nguồn tin được cấu hình động và có thể thêm/bớt theo thời gian."
          : "Sources are config-driven and may be added or removed over time."}
      </p>
    </Section>
  );
}

function AboutPage() {
  const lang = useLang();
  const t = (en: string, vi: string) => (lang === "vi" ? vi : en);

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("About AI News", "Giới thiệu AI News")}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {t(
          "AI News is an LLM-based news system: stories about AI are fetched hourly, rated and ranked by language models, merged when multiple sources cover the same story, and translated into natural Vietnamese. Every story links back to its original source.",
          "AI News là một hệ thống tin tức vận hành bởi LLM: tin tức về AI được thu thập mỗi giờ, được các mô hình ngôn ngữ chấm điểm và xếp hạng, gộp lại khi nhiều nguồn cùng đưa một tin, và dịch sang tiếng Việt tự nhiên. Mỗi tin đều dẫn về nguồn gốc."
        )}
      </p>

      <Section title={t("How it works", "Cách hoạt động")}>
        <p>
          <strong className="text-foreground">
            {t("1. Fetching.", "1. Thu thập.")}
          </strong>{" "}
          {t(
            "Each enabled source is polled hourly for new AI/tech stories.",
            "Mỗi nguồn đang bật được quét mỗi giờ để tìm tin AI/công nghệ mới."
          )}
        </p>
        <p>
          <strong className="text-foreground">
            {t("2. Scoring.", "2. Chấm điểm.")}
          </strong>{" "}
          {t(
            "An LLM rates each story's relevance, importance, and quality, and assigns a category. Irrelevant stories are hidden and never shown.",
            "Một LLM chấm độ liên quan, tầm quan trọng và chất lượng của từng tin, đồng thời gán danh mục. Tin không liên quan sẽ bị ẩn, không hiển thị."
          )}
        </p>
        <p>
          <strong className="text-foreground">
            {t("3. Merging.", "3. Gộp tin.")}
          </strong>{" "}
          {t(
            "When multiple sources cover the same story, an LLM clusters them into one canonical item, combining sources and engagement stats.",
            "Khi nhiều nguồn cùng đưa một tin, LLM gộp chúng thành một tin duy nhất, kết hợp các nguồn và số liệu tương tác."
          )}
        </p>
        <p>
          <strong className="text-foreground">
            {t("4. Ranking.", "4. Xếp hạng.")}
          </strong>{" "}
          {t(
            "Stories are ranked by importance × quality, decaying as they age, boosted by real engagement (points and comments) — no manual curation.",
            "Tin được xếp hạng theo tầm quan trọng × chất lượng, giảm dần theo thời gian, được cộng điểm bởi tương tác thực (điểm và bình luận) — không có sự can thiệp thủ công."
          )}
        </p>
        <p>
          <strong className="text-foreground">
            {t("5. Daily TL;DR.", "5. Tóm tắt TL;DR hằng ngày.")}
          </strong>{" "}
          {t(
            "Once a day, an LLM writes a short bulleted summary of the top stories from the last 24 hours, each linked to its story.",
            "Mỗi ngày một lần, LLM viết một bản tóm tắt ngắn gồm các tin nổi bật trong 24 giờ qua, mỗi mục dẫn tới tin gốc."
          )}
        </p>
        <p>
          <strong className="text-foreground">
            {t("6. Translation.", "6. Dịch thuật.")}
          </strong>{" "}
          {t(
            "Titles and summaries are translated into natural, journalist-style Vietnamese — technical terms (LLM, GPU, agent, etc.) are kept in English rather than force-translated.",
            "Tiêu đề và tóm tắt được dịch sang tiếng Việt tự nhiên, theo văn phong báo chí — các thuật ngữ kỹ thuật (LLM, GPU, agent, v.v.) được giữ nguyên tiếng Anh thay vì dịch gượng ép."
          )}
        </p>
      </Section>

      <Sources />

      <Section title={t("Transparency", "Minh bạch")}>
        <p>
          {t(
            "Token usage is shown per story when available. Pipeline stats (run history, item counts) are visible at",
            "Số token dùng cho mỗi tin được hiển thị khi có sẵn. Thống kê pipeline (lịch sử chạy, số lượng tin) có tại"
          )}{" "}
          <Link
            to="/system"
            className="underline underline-offset-2 hover:text-accent"
          >
            /system
          </Link>
          , {t("and the API is documented at", "và API được mô tả tại")}{" "}
          <Link
            to="/mcp"
            className="underline underline-offset-2 hover:text-accent"
          >
            /mcp
          </Link>
          . {t("The source code lives on", "Mã nguồn nằm trên")}{" "}
          <a
            href="https://github.com/duyet/monorepo/tree/master/apps/news"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-accent"
          >
            GitHub
          </a>
          ,{" "}
          {t(
            "with a full technical write-up of the algorithm in",
            "cùng bản mô tả kỹ thuật đầy đủ của thuật toán trong"
          )}{" "}
          <a
            href="https://github.com/duyet/monorepo/blob/master/apps/news/ALGORITHM.md"
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-2 hover:text-accent"
          >
            ALGORITHM.md
          </a>
          .
        </p>
      </Section>

      <Section title={t("A note on accuracy", "Lưu ý về độ chính xác")}>
        <p>
          {t(
            'Stories here are machine-curated and machine-translated. Mistakes are possible — a bad summary, a mistranslation, a misjudged category. If a Vietnamese translation reads off, translation suggestions are welcome from any signed-in reader (look for "Suggest better translation" under a story\'s Vietnamese summary).',
            'Tin ở đây được máy tuyển chọn và dịch tự động. Sai sót có thể xảy ra — tóm tắt chưa chuẩn, dịch sai, hoặc phân loại nhầm. Nếu bản dịch tiếng Việt đọc chưa ổn, mọi độc giả đã đăng nhập đều có thể góp ý (tìm mục "Góp ý bản dịch" dưới phần tóm tắt tiếng Việt của mỗi tin).'
          )}
        </p>
      </Section>
    </div>
  );
}
