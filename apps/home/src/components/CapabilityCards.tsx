import {
  Database,
  GitBranch,
  Plug,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

const CARDS: {
  eyebrow: string;
  title: string;
  body: string;
  Icon: LucideIcon;
}[] = [
  {
    eyebrow: "Data platform",
    title: "Pipelines that stay honest",
    body: "ClickHouse, Airflow, Spark — observability baked in so agents don't invent numbers.",
    Icon: Database,
  },
  {
    eyebrow: "Agent workflows",
    title: "Tools, memory, evals",
    body: "MCP servers, state stores, and routing so agents finish work instead of chatting forever.",
    Icon: Sparkles,
  },
  {
    eyebrow: "Open source",
    title: "Ship where people can fork it",
    body: "Libraries, dashboards, and reference stacks on GitHub — documented enough to reuse.",
    Icon: GitBranch,
  },
  {
    eyebrow: "For agents",
    title: "Machine-readable by default",
    body: "llms.txt, OpenAPI, MCP — the site is meant to be read by humans and tools alike.",
    Icon: Plug,
  },
];

export function CapabilityCards() {
  return (
    <div className="home-cap-grid">
      {CARDS.map((card) => (
        <article key={card.title} className="home-cap-card">
          <div className="home-cap-icon" aria-hidden="true">
            <card.Icon size={18} strokeWidth={1.5} />
          </div>
          <p className="home-cap-eyebrow">{card.eyebrow}</p>
          <h3 className="home-cap-title">{card.title}</h3>
          <p className="home-cap-body">{card.body}</p>
        </article>
      ))}
    </div>
  );
}
