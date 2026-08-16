import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, ExternalLink, Plug, Terminal } from "lucide-react";
import type { ReactNode } from "react";
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

const CLAUDE_CODE_EXAMPLE = `claude mcp add --transport http duyet-news \\
  https://news.duyet.net/api/mcp \\
  --header "Authorization: Bearer <token>"`;

function CodeBlock({ code }: { code: string }) {
  return (
    <pre className="mt-2 max-w-3xl overflow-x-auto rounded-md border border-border bg-muted p-4 text-xs leading-relaxed">
      <code>{code}</code>
    </pre>
  );
}

function ExtLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-0.5 text-accent underline underline-offset-2 hover:no-underline"
    >
      {children}
      <ExternalLink className="h-3 w-3" aria-hidden />
    </a>
  );
}

function McpPage() {
  const lang = useLang();
  const t = (en: string, vi: string) => (lang === "vi" ? vi : en);

  return (
    <div className="py-10">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-accent/10 text-accent">
          <Plug className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="text-2xl font-bold tracking-tight">
          {t("MCP Server", "Máy chủ MCP")}
        </h1>
      </div>
      <p className="mt-2 max-w-3xl text-sm text-muted-foreground">
        {t(
          "MCP server for pushing news and managing sources. Implements the",
          "Máy chủ MCP để đẩy tin tức và quản lý nguồn tin. Triển khai theo"
        )}{" "}
        <ExtLink href="https://modelcontextprotocol.io">
          {t("Model Context Protocol", "chuẩn Model Context Protocol")}
        </ExtLink>
        .
      </p>

      <section className="mt-6">
        <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Plug className="h-3.5 w-3.5" aria-hidden />
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
        <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <Terminal className="h-3.5 w-3.5" aria-hidden />
          {t("Use with your app", "Dùng với ứng dụng của bạn")}
        </h2>
        <div className="mt-2 space-y-3 text-sm">
          <div>
            <p className="font-semibold text-foreground">
              <ExtLink href="https://docs.claude.com/en/docs/claude-code/mcp">
                Claude Code
              </ExtLink>
            </p>
            <CodeBlock code={CLAUDE_CODE_EXAMPLE} />
          </div>
          <div>
            <p className="font-semibold text-foreground">
              <ExtLink href="https://modelcontextprotocol.io/quickstart/user">
                Claude Desktop
              </ExtLink>
            </p>
            <p className="mt-1 text-muted-foreground">
              {t(
                "Use the same connect config above.",
                "Dùng cấu hình kết nối ở trên."
              )}{" "}
              {t(
                "Paste it under Settings → Developer → Edit Config.",
                "Dán vào Settings → Developer → Edit Config."
              )}
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">
              <ExtLink href="https://platform.openai.com/docs/actions">
                ChatGPT
              </ExtLink>
            </p>
            <p className="mt-1 text-muted-foreground">
              {t(
                "Add it as a connector with the same URL and bearer token, or use the REST API above for custom GPT Actions.",
                "Thêm làm connector với cùng URL và bearer token, hoặc dùng REST API ở trên cho custom GPT Actions."
              )}
            </p>
          </div>
          <div>
            <p className="font-semibold text-foreground">
              {t("Other MCP clients", "Client MCP khác")}
            </p>
            <p className="mt-1 text-muted-foreground">
              {t(
                "Any MCP-capable client works the same way — e.g.",
                "Bất kỳ client hỗ trợ MCP nào cũng dùng được — vd."
              )}{" "}
              <ExtLink href="https://cursor.com/docs/context/mcp">
                Cursor
              </ExtLink>
              {" — "}
              {t(
                "the URL and Authorization header are all you need.",
                "chỉ cần URL và header Authorization."
              )}
            </p>
          </div>
        </div>
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
        <h2 className="flex items-center gap-1.5 text-sm font-bold uppercase tracking-wider text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" aria-hidden />
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
