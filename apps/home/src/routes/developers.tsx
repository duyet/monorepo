import { Eyebrow, Reveal, SecHead } from "@duyet/components";
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
    <pre className="rd-card overflow-x-auto p-[14px] font-[var(--font-mono)] text-[12.5px] leading-[1.65] text-[var(--rd-text-2)]">
      <code>{children}</code>
    </pre>
  );
}

function DevelopersPage() {
  return (
    <div className="page-enter bg-[var(--rd-bg)] text-[var(--rd-text)]">
      <div className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]">
        {/* intro */}
        <Reveal>
          <Eyebrow>Developers · API</Eyebrow>
          <h1 className="rd-display mt-[13px] text-[clamp(2rem,4.2vw,3.3rem)] leading-[1.04]">
            Duyet Developer{" "}
            <span className="text-[var(--rd-accent)]">Resources</span>
          </h1>
          <p className="rd-lead mt-6 max-w-[62ch]">
            Everything on duyet.net is readable by machines, not just people.
            This page collects what's available for developers and AI agents: a
            public stats API, an MCP server your assistant can connect to, and
            machine-readable indexes that describe the rest of the site.
          </p>
        </Reveal>

        {/* public api */}
        <section className="mt-[clamp(48px,7vw,80px)]">
          <Reveal>
            <SecHead num="01" eyebrow="Public API" title="Stats & metrics API" />
            <p className="text-[var(--rd-text-2)] max-w-[62ch] text-[15px] leading-[1.65]">
              The public API serves site metrics and insights. It is available
              at{" "}
              <a href="https://api.duyet.net" className="rd-ulink">
                https://api.duyet.net
              </a>{" "}
              (primary), with a same-origin mirror at{" "}
              <a href="/api" className="rd-ulink">
                https://duyet.net/api
              </a>
              . All GET endpoints below are public and need no authentication.
            </p>
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

            <div className="mt-8 rd-g2">
              <div className="rd-card p-[clamp(18px,2.2vw,26px)]">
                <Eyebrow>Authentication</Eyebrow>
                <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--rd-text-2)]">
                  Public GET endpoints need no auth.{" "}
                  <code className="font-[var(--font-mono)] text-[12.5px]">
                    POST /api/llm/generate
                  </code>{" "}
                  uses{" "}
                  <code className="font-[var(--font-mono)] text-[12.5px]">
                    Authorization: Bearer &lt;token&gt;
                  </code>{" "}
                  — request access by email{" "}
                  <a href="mailto:me@duyet.net" className="rd-ulink">
                    me@duyet.net
                  </a>
                  . OAuth scopes{" "}
                  <code className="font-[var(--font-mono)] text-[12.5px]">
                    read:profile
                  </code>{" "}
                  and{" "}
                  <code className="font-[var(--font-mono)] text-[12.5px]">
                    chat
                  </code>{" "}
                  are declared in{" "}
                  <a
                    href="/.well-known/oauth-protected-resource"
                    className="rd-ulink"
                  >
                    /.well-known/oauth-protected-resource
                  </a>
                  .
                </p>
              </div>
              <div className="rd-card p-[clamp(18px,2.2vw,26px)]">
                <Eyebrow>Rate limits</Eyebrow>
                <p className="mt-3 text-[13.5px] leading-[1.65] text-[var(--rd-text-2)]">
                  Responses carry{" "}
                  <code className="font-[var(--font-mono)] text-[12.5px]">
                    RateLimit-Limit
                  </code>
                  ,{" "}
                  <code className="font-[var(--font-mono)] text-[12.5px]">
                    RateLimit-Remaining
                  </code>
                  , and{" "}
                  <code className="font-[var(--font-mono)] text-[12.5px]">
                    RateLimit-Reset
                  </code>{" "}
                  headers. Exceeding the limit returns{" "}
                  <code className="font-[var(--font-mono)] text-[12.5px]">429</code>{" "}
                  with a{" "}
                  <code className="font-[var(--font-mono)] text-[12.5px]">
                    Retry-After
                  </code>{" "}
                  header — back off and retry after that many seconds.
                </p>
              </div>
            </div>
          </Reveal>
        </section>

        {/* mcp */}
        <section className="mt-[clamp(48px,7vw,80px)]">
          <Reveal>
            <SecHead num="02" eyebrow="MCP" title="Connect AI assistants" />
            <p className="text-[var(--rd-text-2)] max-w-[62ch] text-[15px] leading-[1.65]">
              The MCP server exposes Duyet's CV, blog posts, GitHub activity,
              and contact tools over Streamable HTTP. Point any MCP-compatible
              client (Claude, Cursor, and others) at{" "}
              <a href="https://mcp.duyet.net/mcp" className="rd-ulink">
                https://mcp.duyet.net/mcp
              </a>
              :
            </p>
            <div className="mt-4 max-w-[640px]">
              <CodeBlock>{`claude mcp add --transport http duyet https://mcp.duyet.net/mcp`}</CodeBlock>
            </div>
          </Reveal>
        </section>

        {/* machine-readable files */}
        <section className="mt-[clamp(48px,7vw,80px)]">
          <Reveal>
            <SecHead
              num="03"
              eyebrow="Discovery"
              title="Machine-readable files"
            />
            <ul className="mt-2 flex flex-col divide-y divide-[var(--rd-border)] border-y border-[var(--rd-border)]">
              {[
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
              ].map((file) => (
                <li key={file.href} className="flex flex-wrap gap-x-4 py-3">
                  <a
                    href={file.href}
                    className="rd-ulink font-[var(--font-mono)] text-[13px]"
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

        {/* quickstart */}
        <section className="mt-[clamp(48px,7vw,80px)] pb-[clamp(24px,4vw,48px)]">
          <Reveal>
            <SecHead num="04" eyebrow="Quickstart" title="Try it in 30 seconds" />
            <div className="flex flex-col gap-3 max-w-[720px]">
              <CodeBlock>{`curl https://api.duyet.net/health`}</CodeBlock>
              <CodeBlock>{`curl https://api.duyet.net/api/ai/percentage/current`}</CodeBlock>
              <CodeBlock>{`curl https://api.duyet.net/api/insights/overview`}</CodeBlock>
            </div>
          </Reveal>
        </section>
      </div>
    </div>
  );
}
