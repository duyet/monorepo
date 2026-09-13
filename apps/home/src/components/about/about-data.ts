import { DEFAULT_AREAS } from "@duyet/components";
import { addUtmParams } from "../../../app/lib/utm";

const experienceYears = "8+ years";

const focus =
  "Data pipelines, warehouses, and observability. Agent workflows, model routing, evaluation, and usage analytics. Small, sharp tools with clean interfaces.";

const stack =
  "Python, Rust, TypeScript · Spark, Airflow, ClickHouse, BigQuery, Kafka · Kubernetes, AWS, GCP, Cloudflare · LlamaIndex, AI SDK, LangGraph.";

const elsewhere = [
  {
    title: "Résumé",
    description: "Roles, references, and the long-form story.",
    url: addUtmParams("https://cv.duyet.net", "about_page", "resume_card"),
  },
  {
    title: "GitHub",
    description: "Open source across Python, Rust, and TypeScript.",
    url: addUtmParams("https://github.com/duyet", "about_page", "github_card"),
  },
  {
    title: "LinkedIn",
    description: "Professional history and career context.",
    url: addUtmParams(
      "https://linkedin.com/in/duyet",
      "about_page",
      "linkedin_card"
    ),
  },
  {
    title: "Blog",
    description: "Writing on data engineering, AI, and OSS.",
    url: addUtmParams("https://blog.duyet.net", "about_page", "blog_card"),
  },
];

const expertise = DEFAULT_AREAS.map((a) => ({
  area: a.title,
  yr: `${a.years} yr`,
  desc: a.description,
  tools: a.tags,
}));

const techStack = [
  {
    g: "Coding agents",
    icon: "bot",
    items: ["Claude", "Codex", "Grok Build", "Grok Bot"],
  },
  {
    g: "Languages",
    icon: "code",
    items: ["Python", "Rust", "TypeScript", "SQL"],
  },
  {
    g: "Data",
    icon: "disk",
    items: [
      "ClickHouse",
      "Spark",
      "Airflow",
      "BigQuery",
      "Kafka",
      "dbt",
      "DuckDB",
    ],
  },
  {
    g: "Cloud & Infra",
    icon: "server",
    items: ["Kubernetes", "AWS", "GCP", "Cloudflare", "Terraform"],
  },
  {
    g: "AI & Agents",
    icon: "bot",
    items: ["LangGraph", "LlamaIndex", "AI SDK", "Claude API"],
  },
];

export {
  elsewhere,
  experienceYears,
  expertise,
  focus,
  stack,
  techStack,
};
