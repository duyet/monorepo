import {
  Bot,
  Check,
  Code2,
  Database,
  Plug,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import { Link } from "@tanstack/react-router";
import { artFor } from "../data/ascii-art";

const PERKS = [
  {
    Icon: Bot,
    title: "Access to AI agents",
    body: "Teammates that use your tools and deliver finished work.",
  },
  { Icon: Zap, title: "Data platforms that stay honest" },
  { Icon: Sparkles, title: "MCP tools for Claude & Cursor" },
  { Icon: Database, title: "ClickHouse monitoring & pipelines" },
  { Icon: Code2, title: "Open-source libraries & charts" },
  { Icon: Terminal, title: "Machine-readable indexes by default" },
  { Icon: Plug, title: "Public API + developer resources" },
] as const;

const DETAIL_CARDS = [
  {
    title: "An agent that works like a teammate",
    body: "Route models, keep state, and ship drafts — not just chat transcripts.",
    art: artFor("teammate", 1),
    kind: "art" as const,
  },
  {
    title: "Signs into your tools",
    body: "Wire GitHub, ClickHouse, Notion-shaped workflows through MCP and APIs.",
    kind: "apps" as const,
    apps: [
      { label: "GH", color: "#24292f" },
      { label: "CH", color: "#f06040" },
      { label: "CF", color: "#f6821f" },
      { label: "MCP", color: "#536f91" },
    ],
  },
  {
    title: "Comes back with finished work",
    body: "Monitors, PRs, evals, and write-ups — the boring loop that actually ships.",
    kind: "tasks" as const,
    tasks: [
      "Reply to support loops",
      "Fix the flaky pipeline job",
      "Draft the weekly ops note",
      "Relabel the noisy alerts",
      "Ship the MCP changelog",
    ],
  },
];

export function AppsFeaturePanel() {
  return (
    <div className="home-feat-panel">
      <div className="home-feat-side">
        <div className="home-feat-brand">
          <span className="home-feat-brand-name">duyet.net</span>
          <span className="home-feat-badge">
            <Check size={12} strokeWidth={2.5} />
            Open by default
          </span>
        </div>
        <Link to="/projects" className="rd-btn rd-btn-primary home-feat-cta no-underline">
          View projects
        </Link>
        <ul className="home-feat-perks">
          {PERKS.map((perk) => (
            <li key={perk.title} className="home-feat-perk">
              <span className="home-feat-perk-icon" aria-hidden="true">
                <perk.Icon size={15} strokeWidth={1.6} />
              </span>
              <span>
                <span className="home-feat-perk-title">{perk.title}</span>
                {"body" in perk && perk.body ? (
                  <span className="home-feat-perk-body">{perk.body}</span>
                ) : null}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className="home-feat-stack">
        {DETAIL_CARDS.map((card) => (
          <article key={card.title} className="home-feat-card">
            <div className="home-feat-card-copy">
              <h3>{card.title}</h3>
              <p>{card.body}</p>
            </div>
            <div className="home-feat-card-visual" aria-hidden="true">
              {card.kind === "art" ? (
                <img src={card.art} alt="" loading="lazy" className="home-feat-art" />
              ) : null}
              {card.kind === "apps" ? (
                <div className="home-feat-orbit">
                  {card.apps.map((app, i) => (
                    <span
                      key={app.label}
                      className={`home-feat-orbit-app home-feat-orbit-app-${i}`}
                      style={{ background: app.color }}
                    >
                      {app.label}
                    </span>
                  ))}
                  <span className="home-feat-orbit-core">dy</span>
                </div>
              ) : null}
              {card.kind === "tasks" ? (
                <div className="home-feat-tasks">
                  <p className="home-feat-tasks-head">Today</p>
                  <ul>
                    {card.tasks.map((task) => (
                      <li key={task}>
                        <span className="home-feat-check" />
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
