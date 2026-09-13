import { Reveal } from "@duyet/components";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  elsewhere,
  experienceYears,
  expertise,
  focus,
  stack,
  techStack,
} from "../components/about/about-data";
import { ElsewhereCards } from "../components/about/ElsewhereCards";
import { ExpertiseGrid } from "../components/about/ExpertiseGrid";
import { VibeCodingBento } from "../components/about/VibeCodingBento";
import { HeroStory } from "../components/HeroStory";
import { tw } from "../lib/tw";
import { SoftLabel } from "../components/SoftLabel";

const contentLastModified = "2026-09-13";

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

function AboutPage() {
  return (
    <div className="bg-[var(--rd-bg)] text-[var(--rd-text)]">
      {/* Intro — HomeHero pattern, no art */}
      <section>
        <div className="mx-auto w-full max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(3.5rem,8vw,6.5rem)] pb-[clamp(2.5rem,5vw,4rem)]">
          <Reveal>
            <div className="min-w-0 max-w-[46rem]">
              <h1 className="m-0 flex flex-col gap-3">
                <span className={tw.display}>About</span>
                <span className={tw.title}>
                  I build data platforms, and the AI agents that run on top of
                  them.
                </span>
              </h1>
              <HeroStory />
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <a
                  href="https://cv.duyet.net"
                  className={tw.btnPrimary}
                  target="_blank"
                  rel="noreferrer"
                >
                  Resume
                </a>
                <Link to="/contact" className={tw.btnGhost}>
                  Contact
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Focus & stack */}
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)]">
        <Reveal>
          <div className="grid gap-4 min-[720px]:grid-cols-2">
            <article className="rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)] p-5">
              <SoftLabel tone="pine">Focus</SoftLabel>
              <p className="mt-3 m-0 text-[0.95rem] leading-[1.6] text-[var(--rd-text-2)]">
                {focus}
              </p>
            </article>
            <article className="rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)] p-5">
              <SoftLabel tone="slate">Stack</SoftLabel>
              <p className="mt-3 m-0 text-[0.95rem] leading-[1.6] text-[var(--rd-text-2)]">
                {stack}
              </p>
            </article>
          </div>
        </Reveal>
      </section>

      {/* Agents */}
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(48px,6vw,80px)]">
        <Reveal>
          <VibeCodingBento techStack={techStack} />
        </Reveal>
      </section>

      {/* Expertise */}
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(48px,6vw,80px)]">
        <Reveal>
          <ExpertiseGrid
            expertise={expertise}
            experienceYears={experienceYears}
          />
        </Reveal>
      </section>

      {/* Elsewhere */}
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(32px,4vw,48px)]">
        <Reveal>
          <ElsewhereCards elsewhere={elsewhere} />
        </Reveal>
      </section>

      {/* Closing */}
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(48px,7vw,88px)]">
        <h2 className="m-0 max-w-[20rem] font-[family-name:var(--font-display)] text-[clamp(1.6rem,3vw,2.1rem)] font-normal tracking-[-0.035em] leading-[1.2] text-pretty">
          Prefer the long-form{" "}
          <a
            href="https://cv.duyet.net"
            className="text-inherit underline decoration-[color-mix(in_srgb,var(--rd-accent)_45%,transparent)] underline-offset-[0.14em] hover:decoration-[var(--rd-accent)]"
            target="_blank"
            rel="noreferrer"
          >
            résumé
          </a>
          , or just say hi.
        </h2>
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a
            href="https://cv.duyet.net"
            className={tw.btnPrimary}
            target="_blank"
            rel="noreferrer"
          >
            Resume
          </a>
          <Link to="/contact" className={tw.btnGhost}>
            Contact
          </Link>
        </div>
      </section>
    </div>
  );
}
