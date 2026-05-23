import { createFileRoute } from "@tanstack/react-router";
import { addUtmParams } from "../../app/lib/utm";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";

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

function AboutPage() {
  return (
    <div className="min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)]">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-6 pt-24 pb-20 md:px-8 md:pt-32 md:pb-32">
        <article className="flex flex-col gap-6">
          <h1 className="text-4xl font-medium tracking-tight md:text-5xl text-[color:var(--foreground)]">
            About
          </h1>

          <p className="mt-4 text-lg leading-relaxed text-[color:var(--foreground)]">
            I’m a Senior Data &amp; AI Engineer with {experienceYears} of
            experience across modern data infrastructure, AI/ML platforms, and
            distributed systems.
          </p>

          <p className="text-base leading-relaxed text-[color:var(--muted)]">
            I care about systems that are easy to operate, easy to explain, and
            boring in the places where reliability matters. Most of my work sits
            where data products, AI tools, and engineering platforms meet.
          </p>

          <h2 className="mt-8 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">Focus</h2>
          <p className="text-base leading-relaxed text-[color:var(--muted)]">
            Data pipelines, warehouses, observability. Agent workflows, model
            routing, evaluation, and usage analytics. Small tools and clean
            interfaces.
          </p>

          <h2 className="mt-8 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">Stack</h2>
          <p className="text-base leading-relaxed text-[color:var(--muted)]">
            Python, Rust, TypeScript. Spark, Airflow, ClickHouse, BigQuery,
            Kafka. Kubernetes, AWS, GCP, Cloudflare. LlamaIndex, AI SDK,
            LangGraph.
          </p>

          <h2 className="mt-8 text-2xl font-semibold tracking-tight text-[color:var(--foreground)]">
            Elsewhere
          </h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {links.map((item) => (
              <a
                key={item.title}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-v2 p-5 block no-underline group"
              >
                <h3 className="font-semibold text-lg tracking-tight text-[color:var(--foreground)] group-hover:text-[color:var(--accent)] transition-colors duration-150">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[color:var(--muted)] leading-relaxed">
                  {item.description}
                </p>
              </a>
            ))}
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
