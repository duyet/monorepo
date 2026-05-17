import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { addUtmParams } from "../../app/lib/utm";
import { SiteFooter, SiteHeader } from "../components/SiteChrome";
import { WorkStackSection } from "../components/WorkStackSection";

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
      {
        title: "About Duyet | Senior Data & AI Engineer",
      },
      {
        name: "description",
        content: `Senior Data & AI Engineer with ${experienceYears} of experience building scalable data infrastructure, AI/ML platforms, and distributed systems. Expertise in modern data engineering, real-time processing, and cloud-native architectures.`,
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://duyet.net/about",
      },
    ],
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
    description:
      "Experience building scalable data infrastructure, AI applications, and production systems.",
    url: addUtmParams("https://cv.duyet.net", "about_page", "resume_card"),
  },
  {
    title: "GitHub",
    description:
      "Open source work across Python, Rust, TypeScript, analytics, and developer tooling.",
    url: addUtmParams("https://github.com/duyet", "about_page", "github_card"),
  },
  {
    title: "LinkedIn",
    description:
      "Professional history, roles, and career context in data and platform engineering.",
    url: addUtmParams(
      "https://linkedin.com/in/duyet",
      "about_page",
      "linkedin_card"
    ),
  },
  {
    title: "Blog",
    description:
      "Technical writing on data engineering, distributed systems, AI agents, and open source.",
    url: addUtmParams("https://blog.duyet.net", "about_page", "blog_card"),
  },
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <SiteHeader />

      <main className="relative z-10 bg-[var(--background)] pb-16">
        <section className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 md:py-16 lg:px-10 lg:py-20">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.12em] text-[var(--muted-foreground)]">
            About
          </p>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(300px,0.55fr)] lg:items-end">
            <div className="max-w-[780px] space-y-6">
              <h1 className="text-balance text-4xl font-semibold leading-[1.08] sm:text-5xl lg:text-6xl">
                Building data and AI systems that stay useful in production.
              </h1>
              <p className="max-w-[680px] text-base leading-7 text-[var(--body)] sm:text-lg">
                I’m a Senior Data & AI Engineer with {experienceYears} of experience across
                modern data infrastructure, AI/ML platforms, distributed
                systems, and cloud-native engineering.
              </p>
            </div>

            <div className="space-y-4 text-base leading-7 text-[var(--muted-foreground)]">
              <p>
                I care about systems that are easy to operate, easy to explain,
                and boring in the places where reliability matters.
              </p>
              <p>
                Most of my work sits where data products, AI tools, and
                engineering platforms meet.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1180px] px-5 sm:px-8 lg:px-10">
          <div className="border-y border-[var(--hairline)]">
            {links.map((item) => (
              <a
                key={item.title}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group grid gap-2 border-t border-[var(--hairline)] py-5 text-[var(--foreground)] transition-colors first:border-t-0 hover:text-[var(--muted-foreground)] md:grid-cols-[160px_1fr] md:gap-8 md:items-start"
              >
                <h2 className="text-lg font-semibold">
                  {item.title}
                </h2>
                <p className="text-sm leading-6 text-[var(--muted-foreground)]">
                  {item.description}
                </p>
              </a>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-[1180px] px-5 sm:px-8 lg:px-10">
          <WorkStackSection
            repositoryUrl={addUtmParams(
              "https://github.com/duyet",
              "about_page",
              "skills_github"
            )}
          />
        </section>

        <section className="mx-auto mt-14 max-w-[1180px] px-5 pb-16 sm:px-8 lg:px-10">
          <div className="grid gap-5 border-y border-[var(--hairline)] py-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                Follow the work
              </h2>
              <p className="mt-1 text-base font-medium text-[var(--muted-foreground)]">
                Blog posts, project notes, analytics, and small tools across
                the Duyet network.
              </p>
            </div>
            <a
              href={addUtmParams(
                "https://blog.duyet.net",
                "about_page",
                "follow_blog"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--foreground)] px-5 py-3 text-sm font-medium text-[var(--background)] transition-colors hover:bg-[var(--foreground)]/80"
            >
              Read blog
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
