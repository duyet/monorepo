import { Eyebrow, Reveal } from "@duyet/components";
import { createFileRoute } from "@tanstack/react-router";

const API_ENDPOINTS: Array<{ method: string; path: string; desc: string }> = [
  {
    method: "GET",
    path: "/health",
    desc: "Service health check.",
  },
  {
    method: "GET",
    path: "/api/ai/percentage/current",
    desc: "How much of duyet.net is AI-written, right now.",
  },
  {
    method: "GET",
    path: "/api/ai/percentage/history?days=N",
    desc: "AI-percentage time series for the last N days.",
  },
  {
    method: "GET",
    path: "/api/ai/percentage/available",
    desc: "Days with AI-percentage data available.",
  },
  {
    method: "GET",
    path: "/api/insights/overview",
    desc: "Aggregated development insights from this site.",
  },
  {
    method: "POST",
    path: "/api/llm/generate",
    desc: "LLM generation (card descriptions). Requires a bearer token.",
  },
];

const DISCOVERY = [
  {
    href: "/openapi.json",
    label: "/openapi.json",
    desc: "OpenAPI 3.1 spec for the public API.",
  },
  {
    href: "/llms.txt",
    label: "/llms.txt",
    desc: "LLM-friendly index of the whole site.",
  },
  {
    href: "/sitemap.xml",
    label: "/sitemap.xml",
    desc: "Every indexable page.",
  },
  {
    href: "/.well-known/api-catalog",
    label: "/.well-known/api-catalog",
    desc: "Link-set catalog of available APIs.",
  },
  {
    href: "/.well-known/oauth-protected-resource",
    label: "/.well-known/oauth-protected-resource",
    desc: "OAuth protected-resource metadata.",
  },
  {
    href: "/.well-known/mcp/server-card.json",
    label: "/.well-known/mcp/server-card.json",
    desc: "MCP server card.",
  },
];

export const Route = createFileRoute("/developers")({
  component: DevelopersPage,
  head: () => ({
    meta: [
      { title: "Duyet Developer Resources – API, MCP & Tools" },
      {
        name: "description",
        content:
          "Public stats API, MCP server, and machine-readable indexes for duyet.net — everything developers and AI agents need to integrate with the site.",
      },
    ],
    links: [{ rel: "canonical", href: "https://duyet.net/developers" }],
  }),
});

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)] overflow-x-auto p-[14px] font-[var(--font-mono)] text-[12.5px] leading-[1.65] text-[var(--rd-text-2)]">
      <code>{children}</code>
    </pre>
  );
}

function DevelopersPage() {
  return (
    <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <div className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]">
        <Reveal>
          <Eyebrow>Developers</Eyebrow>
          <h1 className="font-[family-name:var(--font-display)] font-normal tracking-[-0.025em] mt-[13px] text-[clamp(2rem,4.2vw,3.3rem)] leading-[1.04]">
            API, MCP, and machine-readable indexes.
          </h1>
          <p className="text-[1.05rem] leading-[1.65] text-[var(--rd-text-2)] mt-6 max-w-[62ch]">
            Public stats at{" "}
            <a
              href="https://api.duyet.net"
              className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]"
            >
              api.duyet.net
            </a>{" "}
            (same-origin mirror at{" "}
            <a
              href="/api"
              className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]"
            >
              duyet.net/api
            </a>
            ), an MCP server, and the files agents use to find the rest of the
            site. GET endpoints need no auth.
          </p>
        </Reveal>

        <section className="mt-9 border-t border-[var(--rd-border)] pt-7">
          <Reveal>
            <h2 className="text-[1.05rem] font-medium tracking-[-0.01em]">
              Public API
            </h2>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left text-[13.5px]">
                <thead>
                  <tr className="border-b border-[var(--rd-border)]">
                    <th className="py-2 pr-4 font-medium tracking-[-0.01em]">
                      Method
                    </th>
                    <th className="py-2 pr-4 font-medium tracking-[-0.01em]">
                      Endpoint
                    </th>
                    <th className="py-2 font-medium tracking-[-0.01em]">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {API_ENDPOINTS.map((endpoint) => (
                    <tr
                      key={endpoint.path}
                      className="border-b border-[var(--rd-border)] align-top"
                    >
                      <td className="py-2.5 pr-4 font-[var(--font-mono)] text-[12px] whitespace-nowrap">
                        <span
                          className={
                            endpoint.method === "POST"
                              ? "text-[var(--rd-warn)]"
                              : undefined
                          }
                        >
                          {endpoint.method}
                        </span>
                      </td>
                      <td className="py-2.5 pr-4 font-[var(--font-mono)] text-[12.5px]">
                        {endpoint.path}
                      </td>
                      <td className="py-2.5 text-[var(--rd-text-2)] leading-[1.55]">
                        {endpoint.desc}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-5 max-w-[62ch] text-[14.5px] leading-[1.65] text-[var(--rd-text-2)]">
              Public GET endpoints need no auth.{" "}
              <code className="font-[var(--font-mono)] text-[12.5px]">
                POST /api/llm/generate
              </code>{" "}
              uses{" "}
              <code className="font-[var(--font-mono)] text-[12.5px]">
                Authorization: Bearer &lt;token&gt;
              </code>{" "}
              — request access at{" "}
              <a
                href="mailto:me@duyet.net"
                className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]"
              >
                me@duyet.net
              </a>
              . OAuth scopes{" "}
              <code className="font-[var(--font-mono)] text-[12.5px]">
                read:profile
              </code>{" "}
              and{" "}
              <code className="font-[var(--font-mono)] text-[12.5px]">chat</code>{" "}
              are declared in{" "}
              <a
                href="/.well-known/oauth-protected-resource"
                className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]"
              >
                /.well-known/oauth-protected-resource
              </a>
              . Responses carry{" "}
              <code className="font-[var(--font-mono)] text-[12.5px]">
                RateLimit-*
              </code>{" "}
              headers; exceeding the limit returns{" "}
              <code className="font-[var(--font-mono)] text-[12.5px]">429</code>{" "}
              with{" "}
              <code className="font-[var(--font-mono)] text-[12.5px]">
                Retry-After
              </code>
              .
            </p>
          </Reveal>
        </section>

        <section className="mt-9 border-t border-[var(--rd-border)] pt-7">
          <Reveal>
            <h2 className="text-[1.05rem] font-medium tracking-[-0.01em]">
              MCP
            </h2>
            <p className="mt-3 max-w-[62ch] text-[14.5px] leading-[1.65] text-[var(--rd-text-2)]">
              CV, blog posts, GitHub activity, and contact tools over Streamable
              HTTP at{" "}
              <a
                href="https://mcp.duyet.net/mcp"
                className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)]"
              >
                https://mcp.duyet.net/mcp
              </a>
              :
            </p>
            <div className="mt-4 max-w-[640px]">
              <CodeBlock>{`claude mcp add --transport http duyet https://mcp.duyet.net/mcp`}</CodeBlock>
            </div>
          </Reveal>
        </section>

        <section className="mt-9 border-t border-[var(--rd-border)] pt-7">
          <Reveal>
            <h2 className="text-[1.05rem] font-medium tracking-[-0.01em]">
              Machine-readable files
            </h2>
            <ul className="mt-3 flex flex-col divide-y divide-[var(--rd-border)] border-y border-[var(--rd-border)]">
              {DISCOVERY.map((file) => (
                <li key={file.href} className="flex flex-wrap gap-x-4 py-3">
                  <a
                    href={file.href}
                    className="text-[var(--rd-accent-ink)] underline decoration-[color-mix(in_srgb,var(--rd-accent)_40%,transparent)] underline-offset-2 hover:decoration-[var(--rd-accent)] font-[var(--font-mono)] text-[13px]"
                  >
                    {file.label}
                  </a>
                  <span className="text-[var(--rd-text-3)] text-[13.5px]">
                    {file.desc}
                  </span>
                </li>
              ))}
            </ul>
          </Reveal>
        </section>

        <section className="mt-9 border-t border-[var(--rd-border)] pt-7 pb-[clamp(24px,4vw,48px)]">
          <Reveal>
            <h2 className="text-[1.05rem] font-medium tracking-[-0.01em]">
              Quickstart
            </h2>
            <div className="mt-4 flex flex-col gap-3 max-w-[720px]">
              <CodeBlock>{`curl https://api.duyet.net/health`}</CodeBlock>
              <CodeBlock>{`curl https://api.duyet.net/api/ai/percentage/current`}</CodeBlock>
              <CodeBlock>{`curl https://api.duyet.net/api/insights/overview`}</CodeBlock>
              <CodeBlock>{`duyet contact --name Ada --email ada@example.com --message "Hi" --yes`}</CodeBlock>
              <CodeBlock>{`duyet chat "hello" --session test`}</CodeBlock>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
