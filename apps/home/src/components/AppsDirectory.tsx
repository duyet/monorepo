"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";

type Filter = "All" | "AI" | "Data" | "Tools" | "Writing";

type DirectoryApp = {
  name: string;
  by: string;
  href: string;
  blurb: string;
  filters: Filter[];
  tone: string;
};

const APPS: DirectoryApp[] = [
  {
    name: "AnyRouter",
    by: "duyet",
    href: "https://anyrouter.dev",
    blurb: "One API for every AI model — fallback, BYOK, edge routing.",
    filters: ["All", "AI"],
    tone: "#536f91",
  },
  {
    name: "ClickHouse Monitor",
    by: "duyet",
    href: "https://chmonitor.dev",
    blurb: "Cluster health, query triage, and agent-ready insights.",
    filters: ["All", "Data", "AI"],
    tone: "#8b633f",
  },
  {
    name: "AI Agents",
    by: "duyet",
    href: "https://agents.duyet.net",
    blurb: "Streaming chat agents on Cloudflare Workers.",
    filters: ["All", "AI"],
    tone: "#4a6b8a",
  },
  {
    name: "Knowledge base",
    by: "duyet",
    href: "https://kb.duyet.net",
    blurb: "Public second brain — durable notes, openly indexed.",
    filters: ["All", "Writing"],
    tone: "#5f6257",
  },
  {
    name: "Blog",
    by: "duyet",
    href: "https://blog.duyet.net",
    blurb: "Long-form on data platforms, agents, and shipping.",
    filters: ["All", "Writing"],
    tone: "#6a5578",
  },
  {
    name: "LLM Timeline",
    by: "duyet",
    href: "https://llm-timeline.duyet.net",
    blurb: "Model releases since 2017 with benchmarks.",
    filters: ["All", "AI", "Tools"],
    tone: "#3d5a4c",
  },
  {
    name: "Insights",
    by: "duyet",
    href: "https://insights.duyet.net",
    blurb: "Analytics across GitHub, PostHog, WakaTime, ClickHouse.",
    filters: ["All", "Data", "Tools"],
    tone: "#7f524e",
  },
  {
    name: "ShareHTML",
    by: "duyet",
    href: "https://html.duyet.net",
    blurb: "Share HTML, Markdown, and code — humans and agents.",
    filters: ["All", "Tools"],
    tone: "#5c4a3a",
  },
  {
    name: "Agent State",
    by: "duyet",
    href: "https://agentstate.app",
    blurb: "Persistent state stores for agent workflows.",
    filters: ["All", "AI"],
    tone: "#2f4a5e",
  },
  {
    name: "Homelab",
    by: "duyet",
    href: "https://homelab.duyet.net",
    blurb: "Notes and resources for the home lab.",
    filters: ["All", "Tools"],
    tone: "#4a5568",
  },
];

const FILTERS: Filter[] = ["All", "AI", "Data", "Tools", "Writing"];

export function AppsDirectory() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("All");
  const [active, setActive] = useState(APPS[0]?.name ?? "");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return APPS.filter((app) => {
      if (filter !== "All" && !app.filters.includes(filter)) return false;
      if (!q) return true;
      return (
        app.name.toLowerCase().includes(q) ||
        app.blurb.toLowerCase().includes(q) ||
        app.by.toLowerCase().includes(q)
      );
    });
  }, [query, filter]);

  return (
    <div className="home-dir">
      <label className="home-dir-search">
        <Search size={16} strokeWidth={1.6} aria-hidden="true" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by creator or app name"
          aria-label="Search apps"
        />
      </label>

      <div className="home-dir-filters" role="tablist" aria-label="App filters">
        {FILTERS.map((f) => (
          <button
            key={f}
            type="button"
            role="tab"
            aria-selected={filter === f}
            className={`home-dir-pill ${filter === f ? "is-active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="home-dir-section">
        <div className="home-dir-section-head">
          <h3>From duyet.net</h3>
          <a href="/projects" className="home-dir-viewall">
            View all
          </a>
        </div>

        <ul className="home-dir-grid">
          {filtered.map((app) => {
            const isActive = active === app.name;
            return (
              <li key={app.name}>
                <a
                  href={app.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`home-dir-item ${isActive ? "is-active" : ""}`}
                  onMouseEnter={() => setActive(app.name)}
                  onFocus={() => setActive(app.name)}
                >
                  <span
                    className="home-dir-blob"
                    style={{ background: app.tone }}
                    aria-hidden="true"
                  />
                  <span className="min-w-0">
                    <span className="home-dir-name">
                      {app.name}{" "}
                      <span className="home-dir-by">by {app.by}</span>
                    </span>
                    <span className="home-dir-blurb">{app.blurb}</span>
                  </span>
                </a>
              </li>
            );
          })}
        </ul>

        {filtered.length === 0 ? (
          <p className="home-dir-empty">No apps match that search.</p>
        ) : null}
      </div>
    </div>
  );
}
