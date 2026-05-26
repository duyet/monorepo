import { createFileRoute } from "@tanstack/react-router";
import { addUtmParams } from "../../app/lib/utm";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { Card, CardContent } from "../components/ui/card";

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
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-6 py-12 md:py-24">
        <article className="flex flex-col gap-6">
          <header className="mb-4">
            <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              BIOGRAPHY / CONTEXT
            </span>
            <h1 className="text-3xl md:text-5xl font-semibold tracking-tight mt-2">
              About
            </h1>
          </header>

          <p className="text-lg leading-relaxed font-light">
            I'm a Senior Data &amp; AI Engineer with {experienceYears} of
            experience across modern data infrastructure, AI/ML platforms, and
            distributed systems.
          </p>

          <p className="text-base leading-relaxed text-muted-foreground font-light">
            I care about systems that are easy to operate, easy to explain, and
            boring in the places where reliability matters. Most of my work sits
            where data products, AI tools, and engineering platforms meet.
          </p>

          <h2 className="mt-8 text-xl font-semibold tracking-tight border-b pb-2">
            Focus
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground font-light">
            Data pipelines, warehouses, observability. Agent workflows, model
            routing, evaluation, and usage analytics. Small tools and clean
            interfaces.
          </p>

          <h2 className="mt-8 text-xl font-semibold tracking-tight border-b pb-2">
            Stack
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground font-light">
            Python, Rust, TypeScript. Spark, Airflow, ClickHouse, BigQuery,
            Kafka. Kubernetes, AWS, GCP, Cloudflare. LlamaIndex, AI SDK,
            LangGraph.
          </p>

          <h2 className="mt-8 text-xl font-semibold tracking-tight border-b pb-2">
            Elsewhere
          </h2>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {links.map((item) => (
              <a
                key={item.title}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block no-underline group"
              >
                <Card className="hover:border-foreground/30 transition-colors h-full">
                  <CardContent className="pt-5">
                    <h3 className="font-semibold text-base tracking-tight">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </CardContent>
                </Card>
              </a>
            ))}
          </div>
        </article>
      </main>

      <SiteFooter />
    </div>
  );
}
