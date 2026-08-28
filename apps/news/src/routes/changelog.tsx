import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
import { useLang } from "../lib/lang-context";

interface ChangelogEntry {
  date: string;
  en: string;
  vi: string;
}

const ENTRIES: ChangelogEntry[] = [
  {
    date: "2026-08",
    en: "AI;DR bullets are a 2-line digest (truncated with an ellipsis) and highlight model and org names in the same topic colors as the feed.",
    vi: "Mỗi gạch đầu dòng AI;DR là bản tóm tắt 2 dòng (cắt bằng dấu ba chấm khi dài hơn) và tô màu tên model/tổ chức giống bảng tin.",
  },
  {
    date: "2026-08",
    en: "AI;DR bullets show a small story thumbnail on the right (or the site mark when a story has no image).",
    vi: "Mỗi gạch đầu dòng AI;DR có ảnh thumbnail nhỏ bên phải (hoặc logo trang nếu tin chưa có ảnh).",
  },
  {
    date: "2026-08",
    en: "Added a reader-preferences panel (font, text size, density, background, and section visibility), saved to your browser.",
    vi: "Thêm bảng tuỳ chỉnh hiển thị (font chữ, cỡ chữ, mật độ, màu nền, ẩn/hiện từng mục), lưu trên trình duyệt của bạn.",
  },
  {
    date: "2026-08",
    en: "Story cards now show key sources and a thumbnail image when available, plus multi-paragraph summaries.",
    vi: "Mỗi tin hiển thị nguồn chính và ảnh minh hoạ (nếu có), cùng tóm tắt nhiều đoạn.",
  },
  {
    date: "2026-06",
    en: "Launched an email digest and an MCP server so agents and inboxes can consume the feed directly.",
    vi: "Ra mắt bản tin email và MCP server để agent và hộp thư có thể đọc tin trực tiếp.",
  },
  {
    date: "2026-05",
    en: "Initial launch: an hourly ingestion pipeline, a daily AI;DR summary, and English/Vietnamese translations for every story.",
    vi: "Ra mắt lần đầu: pipeline thu thập tin theo giờ, tóm tắt AI;DR hằng ngày, và bản dịch song ngữ Anh/Việt cho từng tin.",
  },
];

export const Route = createFileRoute("/changelog")({
  head: () => ({
    meta: [{ title: "Changelog | AI News" }],
  }),
  component: ChangelogPage,
});

function ChangelogPage(): ReactElement {
  const lang = useLang();

  return (
    <div className="py-6">
      <h1 className="text-xl font-bold">
        {lang === "vi" ? "Nhật ký thay đổi" : "Changelog"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {lang === "vi"
          ? "Những thay đổi đáng chú ý của AI News. Danh sách này được viết tay và không đầy đủ."
          : "Notable changes to AI News. This list is hand-written and not exhaustive."}
      </p>

      <ol className="mt-6 space-y-6 border-l border-border pl-5">
        {ENTRIES.map((entry) => (
          <li key={entry.en} className="relative">
            <span className="absolute -left-[23px] top-1.5 h-2 w-2 rounded-full bg-accent" />
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              {entry.date}
            </div>
            <p className="mt-1 leading-relaxed">
              {lang === "vi" ? entry.vi : entry.en}
            </p>
          </li>
        ))}
      </ol>

      <p className="mt-8 text-sm text-muted-foreground">
        {lang === "vi"
          ? "Xem toàn bộ lịch sử commit trên "
          : "See the full commit history on "}
        <a
          href="https://github.com/duyet/monorepo/commits/master/apps/news"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-accent"
        >
          GitHub
        </a>
        .
      </p>
    </div>
  );
}
