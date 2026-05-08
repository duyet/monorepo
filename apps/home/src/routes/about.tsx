import { createFileRoute } from "@tanstack/react-router";
import {
  Github as GithubIcon,
  LinkedIn as LinkedInIcon,
} from "@duyet/components/Icons";
import { ArrowRight, BookOpen, FileUser, Radio } from "lucide-react";
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
    icon: FileUser,
    tone: "bg-[#bfdbfe]",
  },
  {
    title: "GitHub",
    description:
      "Open source work across Python, Rust, TypeScript, analytics, and developer tooling.",
    url: addUtmParams("https://github.com/duyet", "about_page", "github_card"),
    icon: GithubIcon,
    tone: "bg-[#a7f3d0]",
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
    icon: LinkedInIcon,
    tone: "bg-[#fecaca]",
  },
  {
    title: "Blog",
    description:
      "Technical writing on data engineering, distributed systems, AI agents, and open source.",
    url: addUtmParams("https://blog.duyet.net", "about_page", "blog_card"),
    icon: BookOpen,
    tone: "bg-[var(--background)]",
  },
];

function AboutPage() {
  return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <SiteHeader />

      <main className="relative z-10 rounded-b-3xl bg-[var(--background)] pb-20 2xl:rounded-b-[4rem]">
        <section className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 md:py-18 lg:px-10 lg:py-24 xl:py-28">
          <p className="mb-4 text-sm font-medium text-[var(--muted-foreground)]">
            About
          </p>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] lg:items-end">
            <div className="max-w-[820px] space-y-6">
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                I build data and AI systems that stay useful in production.
              </h1>
              <p className="max-w-[620px] text-lg font-medium leading-snug tracking-tight text-[var(--foreground)]/80 lg:text-xl">
                Data & AI Engineer with {experienceYears} of experience across
                modern data infrastructure, AI/ML platforms, distributed
                systems, and cloud-native engineering.
              </p>
            </div>

            <div className="space-y-4 text-base font-medium leading-7 text-[var(--muted-foreground)]">
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

        <section className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4 lg:gap-6 xl:gap-8">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex min-h-[220px] flex-col rounded-xl p-5 transition-transform hover:-translate-y-0.5 lg:min-h-[240px] lg:p-6 ${item.tone}`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <h2 className="text-base font-medium lg:text-lg">
                      {item.title}
                    </h2>
                    <Icon className="h-7 w-7 shrink-0 lg:h-8 lg:w-8" />
                  </div>
                  <p className="mt-auto max-w-[560px] text-lg font-medium leading-tight tracking-tight md:text-xl">
                    {item.description}
                  </p>
                </a>
              );
            })}
          </div>
        </section>

        <WorkStackSection
          repositoryUrl={addUtmParams(
            "https://github.com/duyet",
            "about_page",
            "skills_github"
          )}
        />

        <section className="mx-auto mt-24 max-w-[1280px] px-5 sm:px-8 lg:mt-32 lg:px-10 xl:mt-40">
          <div className="grid gap-5 rounded-xl bg-[var(--muted)] p-6 md:grid-cols-[1fr_auto] md:items-center lg:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[var(--foreground)] text-[var(--background)]">
                <Radio className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Follow the work
                </h2>
                <p className="mt-1 text-base font-medium text-[var(--muted-foreground)]">
                  Blog posts, project notes, analytics, and small tools across
                  the Duyet network.
                </p>
              </div>
            </div>
            <a
              href={addUtmParams(
                "https://blog.duyet.net",
                "about_page",
                "follow_blog"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--foreground)] px-6 py-4 text-base font-medium text-[var(--background)] transition-colors hover:bg-[var(--foreground)]/80"
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
