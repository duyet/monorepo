import { Link } from "@tanstack/react-router";

const ROWS: { label: string; items: string[] }[] = [
  {
    label: "Languages",
    items: ["Python", "Rust", "TypeScript", "SQL"],
  },
  {
    label: "Data",
    items: ["ClickHouse", "Spark", "Airflow", "BigQuery", "Kafka", "dbt"],
  },
  {
    label: "Cloud",
    items: ["Kubernetes", "AWS", "GCP", "Cloudflare", "Terraform"],
  },
  {
    label: "AI",
    items: ["LangGraph", "LlamaIndex", "AI SDK", "Claude API", "MCP"],
  },
  {
    label: "Practice",
    items: ["Open source", "Observability", "Edge", "Evals", "GitOps"],
  },
];

export function SkillsBento() {
  return (
    <section className="home-skills" aria-labelledby="home-skills-brand">
      <div className="home-skills-intro">
        <h1 id="home-skills-brand" className="home-skills-brand">
          duyet
        </h1>
        <p className="home-skills-role">AI / Data Engineer</p>
        <p className="home-skills-lead">
          I build AI agents and the data platforms that keep them honest —
          pipelines that scale, systems that stay reliable, open-source by
          default.
        </p>
        <div className="home-cta-row home-skills-actions">
          <Link to="/projects" className="rd-btn rd-btn-primary no-underline">
            View projects
          </Link>
        </div>
      </div>

      <div className="home-skills-rows">
        <p className="home-skills-rows-label">Skills I keep sharp</p>
        <ul className="home-skills-row-list">
          {ROWS.map((row) => (
            <li key={row.label} className="home-skills-row">
              <span className="home-skills-row-label">{row.label}</span>
              <span className="home-skills-row-items">
                {row.items.join(" · ")}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
