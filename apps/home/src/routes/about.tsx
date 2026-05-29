import { createFileRoute } from "@tanstack/react-router";
import { AreasOfExpertise, DEFAULT_AREAS } from "@duyet/components";
import { addUtmParams } from "../../app/lib/utm";

const experienceYears = "8+ years";
const contentLastModified = "2026-05-02";

const profilePageJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  dateCreated: "2020-01-01",
  dateModified: contentLastModified,
  mainEntity: {
    "@type": "Person",
    name: "Duyet Le",
    jobTitle: "Senior Data & AI Engineer",
    email: "me@duyet.net",
    url: "https://duyet.net",
    sameAs: [
      "https://github.com/duyet",
      "https://linkedin.com/in/duyet",
      "https://blog.duyet.net",
    ],
    description: `Senior Data & AI Engineer with ${experienceYears} of experience building scalable data infrastructure, AI/ML platforms, and distributed systems. Expertise in modern data warehousing, real-time processing, and cloud-native architectures.`,
    knowsAbout: [
      "Data Engineering",
      "AI/ML Infrastructure",
      "Platform Engineering",
      "LlamaIndex",
      "AI SDK",
      "LangGraph",
      "ClickHouse",
      "Apache Spark",
      "Apache Airflow",
      "Python",
      "Rust",
      "TypeScript",
      "Kubernetes",
      "AWS",
      "GCP",
      "Kafka",
      "BigQuery",
      "Helm",
      "Distributed Systems",
      "Cloud Computing",
      "Data Warehousing",
      "Machine Learning Infrastructure",
      "DevOps",
    ],
    worksFor: {
      "@type": "Organization",
      name: "Cartrack",
      url: "https://cartrack.us",
    },
    alumniOf: {
      "@type": "CollegeOrUniversity",
      name: "University of Information Technology",
    },
  },
});

export const Route = createFileRoute("/about")({
  component: AboutPage,
  head: () => ({
    meta: [
      { title: "About Duyet | Senior Data & AI Engineer" },
      {
        name: "description",
        content: `Senior Data & AI Engineer with ${experienceYears} of experience building scalable data infrastructure, AI/ML platforms, and distributed systems.`,
      },
    ],
    links: [{ rel: "canonical", href: "https://duyet.net/about" }],
    scripts: [
      {
        type: "application/ld+json",
        children: profilePageJsonLd,
      },
    ],
  }),
});

const links = [
  {
    title: "Resume",
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
    description: "Writing on data engineering, AI agents, and OSS.",
    url: addUtmParams("https://blog.duyet.net", "about_page", "blog_card"),
  },
];

const facts = [
  { label: "Role", value: "Senior Data & AI Engineer" },
  { label: "Experience", value: experienceYears },
  { label: "Based in", value: "Ho Chi Minh City" },
  { label: "Now", value: "Cartrack" },
];

const blocks = [
  {
    heading: "Focus",
    body: "Data pipelines, warehouses, observability. Agent workflows, model routing, evaluation, and usage analytics. Small tools and clean interfaces.",
  },
  {
    heading: "Stack",
    body: "Python, Rust, TypeScript. Spark, Airflow, ClickHouse, BigQuery, Kafka. Kubernetes, AWS, GCP, Cloudflare. LlamaIndex, AI SDK, LangGraph.",
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <main className="mx-auto max-w-[1040px] px-6 py-12 md:py-16 md:px-8">
        <article className="flex flex-col gap-3">
          {/* Intro block */}
          <header className="rounded-lg border bg-background p-6 md:p-8">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              About
            </p>
            <h1 className="mt-3 max-w-2xl text-2xl md:text-3xl font-semibold tracking-tight leading-snug">
              I'm Duyet — a Senior Data &amp; AI Engineer with {experienceYears}{" "}
              building data infrastructure, AI/ML platforms, and distributed
              systems.
            </h1>
            <p className="mt-4 max-w-2xl text-sm md:text-base leading-relaxed text-muted-foreground">
              I care about systems that are easy to operate, easy to explain,
              and boring in the places where reliability matters. Most of my
              work sits where data products, AI tools, and engineering platforms
              meet.
            </p>

            {/* Inline fact pills — block, no dividers */}
            <dl className="mt-6 flex flex-wrap gap-2">
              {facts.map((f) => (
                <div
                  key={f.label}
                  className="rounded-md border px-3 py-1.5 leading-tight"
                >
                  <dt className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {f.label}
                  </dt>
                  <dd className="text-sm font-medium tracking-tight">
                    {f.value}
                  </dd>
                </div>
              ))}
            </dl>
          </header>

          {/* Focus + Stack blocks */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {blocks.map((b) => (
              <section
                key={b.heading}
                className="rounded-lg border bg-background p-6"
              >
                <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {b.heading}
                </h2>
                <p className="mt-3 text-sm md:text-base leading-relaxed">
                  {b.body}
                </p>
              </section>
            ))}
          </div>

          {/* Elsewhere — link blocks */}
          <section className="rounded-lg border bg-background p-6">
            <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Elsewhere
            </h2>
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {links.map((item) => (
                <li key={item.title}>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block h-full rounded-md border p-4 no-underline transition-colors hover:bg-muted"
                  >
                    <h3 className="text-sm font-medium tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </section>

          {/* Areas of expertise block */}
          <section className="rounded-lg border bg-background p-6 md:p-8">
            <AreasOfExpertise areas={DEFAULT_AREAS} />
          </section>
        </article>
      </main>
    </div>
  );
}
