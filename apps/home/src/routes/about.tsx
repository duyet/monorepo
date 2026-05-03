import { createFileRoute, Link } from "@tanstack/react-router";
import { AppCommandPalette } from "@duyet/components";
import {
  Github as GithubIcon,
  LinkedIn as LinkedInIcon,
} from "@duyet/components/Icons";
import { ArrowRight, BookOpen, FileUser, Radio } from "lucide-react";
import { Suspense } from "react";
import { addUtmParams } from "../../app/lib/utm";
import { BuildDate } from "../components/BuildDate";
import { FooterInteractive } from "../components/FooterInteractive";

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
    tone: "bg-[#bfdbfe] dark:bg-[#1f3a5f]",
  },
  {
    title: "GitHub",
    description:
      "Open source work across Python, Rust, TypeScript, analytics, and developer tooling.",
    url: addUtmParams("https://github.com/duyet", "about_page", "github_card"),
    icon: GithubIcon,
    tone: "bg-[#a7f3d0] dark:bg-[#164634]",
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
    tone: "bg-[#fecaca] dark:bg-[#4f1f1f]",
  },
  {
    title: "Blog",
    description:
      "Technical writing on data engineering, distributed systems, AI agents, and open source.",
    url: addUtmParams("https://blog.duyet.net", "about_page", "blog_card"),
    icon: BookOpen,
    tone: "bg-white dark:bg-[#1a1a1a]",
  },
];

const focusAreas = [
  {
    label: "Data systems",
    value: "Pipelines, warehouses, observability, and distributed services",
  },
  {
    label: "AI infrastructure",
    value: "Agent workflows, model routing, evaluation, and usage analytics",
  },
  {
    label: "Engineering practice",
    value: "Small tools, clean interfaces, production hygiene, and writing",
  },
];

const skills = [
  "Python",
  "Rust",
  "TypeScript",
  "Spark",
  "Airflow",
  "ClickHouse",
  "BigQuery",
  "Kafka",
  "Kubernetes",
  "AWS",
  "GCP",
  "LlamaIndex",
  "AI SDK",
  "LangGraph",
];

function AboutPage() {
  return (
    <div className="min-h-screen bg-[#f8f8f2] text-[#1a1a1a] dark:bg-[#0d0e0c] dark:text-[#f8f8f2]">
      <header className="sticky top-0 z-50 bg-[#f8f8f2]/95 backdrop-blur dark:bg-[#0d0e0c]/95">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-5 py-4 sm:px-8 lg:px-10 lg:py-5">
          <Link
            to="/"
            className="flex items-center gap-3 text-xl font-semibold tracking-tight"
          >
            <DuyetMark />
            Duyet Le
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            <a
              href={addUtmParams(
                "https://blog.duyet.net",
                "about",
                "header_blog"
              )}
            >
              Blog
            </a>
            <Link to="/projects">Projects</Link>
            <a
              href={addUtmParams("https://cv.duyet.net", "about", "header_cv")}
            >
              Experience
            </a>
            <a
              href={addUtmParams(
                "https://insights.duyet.net",
                "about",
                "header_insights"
              )}
            >
              Insights
            </a>
            <Link to="/about">About</Link>
          </nav>

          <AppCommandPalette />
        </div>
      </header>

      <main className="relative z-10 rounded-b-3xl bg-[#f8f8f2] pb-20 dark:bg-[#0d0e0c] 2xl:rounded-b-[4rem]">
        <section className="mx-auto max-w-[1280px] px-5 py-14 sm:px-8 md:py-18 lg:px-10 lg:py-24 xl:py-28">
          <p className="mb-4 text-sm font-medium text-[#1a1a1a]/60 dark:text-[#f8f8f2]/60">
            About
          </p>
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(320px,0.55fr)] lg:items-end">
            <div className="max-w-[820px] space-y-6">
              <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
                I build data and AI systems that stay useful in production.
              </h1>
              <p className="max-w-[620px] text-lg font-medium leading-snug tracking-tight text-[#1a1a1a]/80 dark:text-[#f8f8f2]/80 lg:text-xl">
                Data & AI Engineer with {experienceYears} of experience across
                modern data infrastructure, AI/ML platforms, distributed
                systems, and cloud-native engineering.
              </p>
            </div>

            <div className="space-y-4 text-base font-medium leading-7 text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
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

        <section className="mx-auto mt-24 max-w-[1280px] px-5 sm:px-8 lg:mt-32 lg:px-10 xl:mt-40">
          <div className="grid gap-10 lg:grid-cols-[0.8fr_1fr] lg:items-start">
            <div>
              <p className="mb-3 text-sm font-medium text-[#1a1a1a]/60 dark:text-[#f8f8f2]/60">
                Work
              </p>
              <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
                Practical engineering, written down clearly.
              </h2>
            </div>

            <div className="divide-y divide-[#1a1a1a]/12 border-y border-[#1a1a1a]/12 dark:divide-white/12 dark:border-white/12">
              {focusAreas.map((item) => (
                <div
                  key={item.label}
                  className="grid gap-3 py-6 md:grid-cols-[180px_1fr] md:gap-8"
                >
                  <p className="text-sm font-semibold uppercase tracking-normal text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
                    {item.label}
                  </p>
                  <p className="text-xl font-medium leading-tight tracking-tight">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-[1280px] px-5 sm:px-8 lg:mt-32 lg:px-10 xl:mt-40">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-medium text-[#1a1a1a]/60 dark:text-[#f8f8f2]/60">
                Stack
              </p>
              <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">
                Tools I reach for.
              </h2>
            </div>
            <a
              href={addUtmParams(
                "https://github.com/duyet",
                "about_page",
                "skills_github"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-base font-medium"
            >
              Repositories
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>

          <div className="mt-10 flex flex-wrap gap-x-5 gap-y-4 text-2xl font-semibold tracking-tight text-[#1a1a1a]/90 dark:text-[#f8f8f2]/90 md:text-3xl">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </section>

        <section className="mx-auto mt-24 max-w-[1280px] px-5 sm:px-8 lg:mt-32 lg:px-10 xl:mt-40">
          <div className="grid gap-5 rounded-xl bg-white p-6 dark:bg-[#1a1a1a] md:grid-cols-[1fr_auto] md:items-center lg:p-8">
            <div className="flex items-start gap-4">
              <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-[#1a1a1a] text-white dark:bg-[#f8f8f2] dark:text-[#0d0e0c]">
                <Radio className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">
                  Follow the work
                </h2>
                <p className="mt-1 text-base font-medium text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
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
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#1a1a1a] px-6 py-4 text-base font-medium text-white transition-colors hover:bg-[#444] dark:bg-[#f8f8f2] dark:text-[#0d0e0c] dark:hover:bg-white"
            >
              Read blog
              <ArrowRight className="h-5 w-5" />
            </a>
          </div>
        </section>
      </main>

      <footer className="sticky bottom-0 bg-[#f2f2eb] px-5 pb-12 pt-24 dark:bg-[#1a1a1a] sm:px-8 lg:px-10 lg:pb-16 lg:pt-28 xl:pb-20">
        <div className="mx-auto max-w-[1280px]">
          <h2 className="max-w-[820px] text-balance text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
            Build useful systems, then explain them clearly.
          </h2>
          <div className="my-12 flex flex-wrap items-center gap-4 md:my-16">
            <a
              href={addUtmParams(
                "https://github.com/duyet",
                "about_page",
                "footer_github"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-[#1a1a1a] px-6 py-4 text-base font-medium text-white transition-colors hover:bg-[#444] dark:bg-[#f8f8f2] dark:text-[#0d0e0c] dark:hover:bg-white lg:px-8 lg:text-lg"
            >
              GitHub
            </a>
            <a
              href={addUtmParams(
                "https://linkedin.com/in/duyet",
                "about_page",
                "footer_linkedin"
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg border border-[#1a1a1a]/15 px-6 py-4 text-base font-medium transition-colors hover:border-[#1a1a1a] dark:border-white/15 dark:hover:border-white lg:px-8 lg:text-lg"
            >
              LinkedIn
            </a>
          </div>

          <hr className="border-[#1a1a1a]/15 dark:border-white/15" />

          <div className="grid gap-6 pt-10 text-base font-medium md:grid-cols-2 md:pt-16">
            <div className="flex flex-wrap items-center gap-6">
              <span>© Duyet Le</span>
              <a href="/llms.txt" className="underline underline-offset-2">
                llms.txt
              </a>
              <Suspense fallback={<div className="h-10 w-10" />}>
                <FooterInteractive />
              </Suspense>
            </div>
            <div className="flex flex-wrap items-center gap-6 md:justify-end">
              <BuildDate />
              <a
                href={addUtmParams(
                  "https://status.duyet.net",
                  "about_page",
                  "footer_status"
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <span className="h-3 w-3 rounded-full bg-orange-500" />
                <span>All Systems Operational</span>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function DuyetMark() {
  return (
    <span className="grid h-5 w-5 grid-cols-2 gap-0.5" aria-hidden="true">
      <span className="bg-[#1a1a1a] dark:bg-[#f8f8f2]" />
      <span className="translate-y-1 bg-[#1a1a1a] dark:bg-[#f8f8f2]" />
      <span className="-translate-y-1 bg-[#1a1a1a] dark:bg-[#f8f8f2]" />
      <span className="bg-[#1a1a1a] dark:bg-[#f8f8f2]" />
    </span>
  );
}
