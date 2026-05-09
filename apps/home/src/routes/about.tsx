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
        <section className="mx-auto max-w-[1200px] px-6 py-12 sm:px-10 md:py-16 lg:py-20 xl:py-24">
          <p className="mb-6 font-serif text-xl italic text-[var(--primary)] lg:text-2xl">
            About
          </p>
          <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)] lg:items-end">
            <div className="max-w-[880px] space-y-8">
              <h1 className="font-serif text-5xl sm:text-6xl lg:text-[72px] xl:text-[84px]">
                Building data and AI systems that <span className="text-[var(--primary)] italic">stay useful</span> in production.
              </h1>
              <p className="max-w-[680px] text-xl font-normal leading-relaxed text-[var(--body)] lg:text-2xl">
                I’m a Senior Data & AI Engineer with {experienceYears} of experience across
                modern data infrastructure, AI/ML platforms, distributed
                systems, and cloud-native engineering.
              </p>
            </div>

            <div className="space-y-6 text-lg font-normal leading-relaxed text-[var(--muted-foreground)] lg:text-xl">
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

        <section className="mx-auto max-w-[1200px] px-6 sm:px-10">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4 lg:gap-8">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.title}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group flex min-h-[240px] flex-col rounded-2xl p-6 transition-all hover:-translate-y-2 hover:shadow-xl lg:min-h-[280px] lg:p-8 ${item.tone} border border-[var(--border)]`}
                >
                  <div className="flex items-start justify-between gap-6">
                    <h2 className="font-serif text-2xl lg:text-[28px]">
                      {item.title}
                    </h2>
                    <Icon className="h-8 w-8 shrink-0 lg:h-10 lg:w-10 opacity-30" />
                  </div>
                  <p className="mt-auto text-lg font-normal leading-snug text-[var(--body)] lg:text-xl">
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

        <section className="mx-auto mt-24 max-w-[1200px] px-6 pb-20 sm:px-10 lg:mt-32 lg:pb-32">
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
