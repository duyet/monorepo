import { Reveal } from "@duyet/components";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  agentsList,
  elsewhere,
  experienceYears,
  expertise,
  focus,
  stack,
  techStack,
} from "../components/about/about-data";
import { ElsewhereCards } from "../components/about/ElsewhereCards";
import { ExpertiseGrid } from "../components/about/ExpertiseGrid";
import { TechStackGrid } from "../components/about/TechStackGrid";
import { VibeCodingBento } from "../components/about/VibeCodingBento";
import { SoftLabel } from "../components/SoftLabel";

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

function AboutPage() {
  return (
    <div className="page-enter bg-[var(--rd-bg)] text-[var(--rd-text)]">
      {/* Intro — HomeHero pattern, no art */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <Reveal>
            <div className="home-hero-copy home-fade-up">
              <h1 className="home-hero-heading">
                <span className="home-hero-brand">duyet</span>
                <span className="home-hero-title">
                  I build data platforms, and the AI agents that run on top of
                  them.
                </span>
              </h1>
              <p className="home-hero-lead home-fade-up-delay">
                Systems that are easy to operate, easy to explain, and boring
                where reliability matters — open source by default.
              </p>
              <div className="home-cta-row home-hero-actions home-fade-up-delay-2">
                <Link
                  to="/projects"
                  className="rd-btn rd-btn-primary no-underline"
                >
                  View projects
                </Link>
                <Link
                  to="/contact"
                  className="rd-btn rd-btn-ghost no-underline"
                >
                  Say hello
                </Link>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Focus & stack */}
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(40px,5vw,64px)]">
        <Reveal>
          <div className="home-about-focus">
            <article className="home-cap-card">
              <SoftLabel tone="pine">Focus</SoftLabel>
              <p className="home-about-focus-body">{focus}</p>
            </article>
            <article className="home-cap-card">
              <SoftLabel tone="slate">Stack</SoftLabel>
              <p className="home-about-focus-body">{stack}</p>
            </article>
          </div>
        </Reveal>
      </section>

      {/* Agents */}
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(48px,6vw,80px)]">
        <Reveal>
          <VibeCodingBento agentsList={agentsList} />
        </Reveal>
      </section>

      {/* Tech stack */}
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(48px,6vw,80px)]">
        <Reveal>
          <TechStackGrid techStack={techStack} />
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
      <section className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] py-[clamp(48px,6vw,80px)]">
        <Reveal>
          <ElsewhereCards elsewhere={elsewhere} />
        </Reveal>
      </section>

      {/* Closing */}
      <section className="home-closing">
        <h2 className="home-closing-title">
          Prefer the long-form résumé, or just say hi.
        </h2>
        <div className="home-cta-row home-closing-actions">
          <Link to="/projects" className="rd-btn rd-btn-primary no-underline">
            View projects
          </Link>
          <Link to="/contact" className="rd-btn rd-btn-ghost no-underline">
            Contact
          </Link>
        </div>
      </section>
    </div>
  );
}
