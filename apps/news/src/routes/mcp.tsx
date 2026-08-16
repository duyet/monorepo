import { createFileRoute } from "@tanstack/react-router";
import { useLang } from "../lib/lang-context";

export const Route = createFileRoute("/mcp")({
  component: McpPage,
});

const TOOLS = [
  {
    name: "push_items",
    en: "Push one or more news items into the feed.",
    vi: "Thêm một hoặc nhiều tin tức vào bảng tin.",
  },
  {
    name: "list_sources",
    en: "List all configured news sources.",
    vi: "Liệt kê tất cả nguồn tin đã cấu hình.",
  },
  {
    name: "upsert_source",
    en: "Create or update a news source.",
    vi: "Tạo mới hoặc cập nhật một nguồn tin.",
  },
  {
    name: "delete_source",
    en: "Delete a news source by id.",
    vi: "Xóa một nguồn tin theo id.",
  },
  {
    name: "trigger_ingest",
    en: "Trigger a new news ingestion workflow run.",
    vi: "Kích hoạt một lượt thu thập tin tức mới.",
  },
  {
    name: "get_status",
    en: "Get the last 10 workflow runs and item counts grouped by status.",
    vi: "Xem 10 lượt chạy gần nhất và số lượng tin theo trạng thái.",
  },
];

const CLIENT_CONFIG = `{
  "url": "https://news.duyet.net/api/mcp",
  "headers": { "Authorization": "Bearer <token>" }
}`;

const PUSH_ITEM_EXAMPLE = `curl -X POST https://news.duyet.net/api/admin/items \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com/post","title":"New AI model released"}'`;

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="mt-2 max-w-3xl overflow-x-auto rounded-md border border-border bg-muted p-4 text-xs leading-relaxed">
      <code>{code}</code>
    </pre>
  );
}

function McpPage() {
  const lang = useLang();
  const t = (en: string, vi: string) => (lang === "vi" ? vi : en);

  return (
    <div className="py-10">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("MCP Server", "Máy chủ MCP")}
      </h1>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        {t(
          "MCP server for pushing news and managing sources.",
          "Máy chủ MCP để đẩy tin tức và quản lý nguồn tin."
        )}
      </p>

      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("Connect", "Kết nối")}
        </h2>
        <CodeBlock code={CLIENT_CONFIG} />
        <p className="mt-2 text-xs text-muted-foreground">
          {t(
            "Every request needs a bearer token.",
            "Mọi yêu cầu đều cần bearer token."
          )}
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("Tools", "Công cụ")}
        </h2>
        <div className="mt-2 divide-y divide-border rounded-md border border-border text-sm">
          {TOOLS.map((tool) => (
            <div
              key={tool.name}
              className="flex flex-col gap-0.5 px-3 py-2 sm:flex-row sm:items-baseline sm:gap-3"
            >
              <code className="shrink-0 text-xs font-semibold sm:w-32">
                {tool.name}
              </code>
              <span className="text-muted-foreground">
                {t(tool.en, tool.vi)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
          {t("REST example", "Ví dụ REST")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("Push an item via REST:", "Thêm một tin qua REST:")}
        </p>
        <CodeBlock code={PUSH_ITEM_EXAMPLE} />
      </section>

      <p className="mt-6 text-sm text-muted-foreground">
        {t("Full API docs on", "Tài liệu API đầy đủ tại")}{" "}
        <a
          href="https://github.com/duyet/monorepo/tree/master/apps/news"
          target="_blank"
          rel="noopener noreferrer"
          className="text-accent underline underline-offset-2 hover:no-underline"
        >
          GitHub README
        </a>
        .
      </p>
    </div>
  );
}
