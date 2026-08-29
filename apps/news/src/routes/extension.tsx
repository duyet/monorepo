import { createFileRoute, Link } from "@tanstack/react-router";
import { Puzzle } from "lucide-react";
import type { ReactNode } from "react";
import { useLang } from "../lib/lang-context";
import { NEWS_TAB_ZIP_HREF } from "../lib/news-tab-public";

export const Route = createFileRoute("/extension")({
  head: () => ({
    meta: [{ title: "Chrome new tab | AI News" }],
  }),
  component: ExtensionPage,
});

const STEPS = [
  {
    en: "Download the zip and unzip it. You want the folder that contains manifest.json (it is named news-tab).",
    vi: "Tải zip rồi giải nén. Chọn thư mục có file manifest.json (tên thư mục là news-tab).",
  },
  {
    en: "Open chrome://extensions (paste that into the address bar).",
    vi: "Mở chrome://extensions (dán vào thanh địa chỉ).",
  },
  {
    en: "Turn on Developer mode (top right).",
    vi: "Bật Developer mode (góc trên bên phải).",
  },
  {
    en: "Click Load unpacked and pick that unzipped folder.",
    vi: "Bấm Load unpacked và chọn đúng thư mục vừa giải nén.",
  },
  {
    en: "Open a new tab. It should show today's AI;DR and stories from this site.",
    vi: "Mở tab mới. Trang sẽ hiện AI;DR hôm nay và tin từ site này.",
  },
];

function ZipLink({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <a href={NEWS_TAB_ZIP_HREF} download="news-tab.zip" className={className}>
      {children}
    </a>
  );
}

function ExtensionPage() {
  const lang = useLang();
  const t = (en: string, vi: string) => (lang === "vi" ? vi : en);

  return (
    <div className="py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-accent/10 text-accent">
          <Puzzle className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("Chrome new tab", "Tab mới Chrome")}
        </h1>
      </div>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        {t(
          "Replaces Chrome's new tab with today's AI;DR and top stories from this site. Production API is https://news.duyet.net. Not on the Chrome Web Store yet, so you load it unpacked.",
          "Thay tab mới của Chrome bằng AI;DR hôm nay và tin nổi bật từ site này. API mặc định là https://news.duyet.net. Chưa lên Chrome Web Store, nên phải load unpacked."
        )}
      </p>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <ZipLink className="inline-flex items-center rounded-md bg-accent px-3 py-1.5 text-sm font-semibold text-accent-foreground hover:opacity-90">
          {t("Add to Chrome", "Thêm vào Chrome")}
        </ZipLink>
        <ZipLink className="inline-flex items-center rounded-md border border-border px-3 py-1.5 text-sm font-semibold text-muted-foreground hover:border-accent hover:text-accent">
          {t("Download zip", "Tải zip")}
        </ZipLink>
      </div>
      <p className="mt-2 max-w-3xl text-xs text-muted-foreground">
        {t(
          "Both buttons download the same zip. Then follow Load unpacked below. There is no Web Store listing.",
          "Cả hai nút đều tải cùng một file zip. Sau đó làm bước Load unpacked bên dưới. Không có trang trên Web Store."
        )}
      </p>

      <section className="mt-8">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("Load unpacked", "Load unpacked")}
        </h2>
        <ol className="mt-3 max-w-3xl list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
          {STEPS.map((step) => (
            <li key={step.en} className="pl-1">
              {t(step.en, step.vi)}
            </li>
          ))}
        </ol>
      </section>

      <p className="mt-8 max-w-3xl text-xs text-muted-foreground">
        {t(
          "Chrome will warn that the extension is unpacked. That is expected. Source lives in the monorepo at apps/news-tab.",
          "Chrome sẽ cảnh unpacked extension. Đó là bình thường. Mã nguồn nằm trong monorepo ở apps/news-tab."
        )}{" "}
        <Link
          to="/"
          className="text-accent underline underline-offset-2 hover:no-underline"
        >
          {t("Back to the feed.", "Về bảng tin.")}
        </Link>
      </p>
    </div>
  );
}
