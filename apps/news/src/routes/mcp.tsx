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

const CALL_TOOL_EXAMPLE = `curl -X POST https://news.duyet.net/api/mcp \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "push_items",
      "arguments": {
        "items": { "url": "https://example.com/post", "title": "New AI model released" }
      }
    }
  }'`;

const PUSH_ITEM_EXAMPLE = `curl -X POST https://news.duyet.net/api/admin/items \\
  -H "Authorization: Bearer <token>" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com/post","title":"New AI model released"}'`;

const TRIGGER_INGEST_EXAMPLE = `curl -X POST https://news.duyet.net/api/admin/ingest \\
  -H "Authorization: Bearer <token>"`;

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="mt-2 overflow-x-auto rounded-md border border-border bg-muted p-4 text-xs leading-relaxed">
      <code>{code}</code>
    </pre>
  );
}

function McpPage() {
  const lang = useLang();
  const t = (en: string, vi: string) => (lang === "vi" ? vi : en);

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="text-2xl font-bold tracking-tight">
        {t("MCP Server", "Máy chủ MCP")}
      </h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {t(
          "This site exposes a hand-rolled MCP (Model Context Protocol) server for managing the news feed remotely, alongside a plain REST admin API with the same capabilities.",
          "Trang này cung cấp một máy chủ MCP (Model Context Protocol) để quản lý bảng tin từ xa, song song với một REST API quản trị có cùng chức năng."
        )}
      </p>

      <section className="mt-8">
        <h2 className="text-lg font-bold tracking-wide">
          {t("Endpoint & auth", "Endpoint & xác thực")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(
            "POST JSON-RPC 2.0 requests to",
            "Gửi yêu cầu JSON-RPC 2.0 (POST) tới"
          )}{" "}
          <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
            https://news.duyet.net/api/mcp
          </code>
          .{" "}
          {t(
            "Every request must include a bearer token (no session state).",
            "Mọi yêu cầu đều cần header bearer token (không có trạng thái phiên)."
          )}
        </p>
        <CodeBlock code={CLIENT_CONFIG} />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold tracking-wide">
          {t("Tools", "Các công cụ")}
        </h2>
        <ul className="mt-2 space-y-2 text-sm">
          {TOOLS.map((tool) => (
            <li key={tool.name} className="border-b border-border pb-2">
              <code className="text-xs font-semibold">{tool.name}</code>
              <p className="mt-0.5 text-muted-foreground">
                {t(tool.en, tool.vi)}
              </p>
            </li>
          ))}
        </ul>
        <CodeBlock code={CALL_TOOL_EXAMPLE} />
      </section>

      <section className="mt-8">
        <h2 className="text-lg font-bold tracking-wide">
          {t("REST admin API", "REST API quản trị")}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          {t(
            "All routes live under /api/admin/* and require the same bearer token.",
            "Tất cả route nằm dưới /api/admin/* và dùng cùng bearer token."
          )}
        </p>
        <p className="mt-4 text-sm font-medium">
          {t("Push an item", "Thêm một tin")}
        </p>
        <CodeBlock code={PUSH_ITEM_EXAMPLE} />
        <p className="mt-4 text-sm font-medium">
          {t("Trigger an ingest run", "Kích hoạt thu thập")}
        </p>
        <CodeBlock code={TRIGGER_INGEST_EXAMPLE} />
        <p className="mt-4 text-sm text-muted-foreground">
          {t(
            "Other routes: GET /api/admin/sources, PUT /api/admin/sources/:id, DELETE /api/admin/sources/:id, GET /api/admin/status.",
            "Các route khác: GET /api/admin/sources, PUT /api/admin/sources/:id, DELETE /api/admin/sources/:id, GET /api/admin/status."
          )}
        </p>
      </section>
    </div>
  );
}
