import { Eyebrow } from "@duyet/components";
import { createFileRoute } from "@tanstack/react-router";
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
      <div className="mx-auto max-w-[var(--rd-maxw)] px-[var(--rd-pad)] pt-[clamp(40px,5vw,64px)] pb-[clamp(56px,8vw,96px)]">
        {/* Intro block */}
        <div>
          <Eyebrow>About</Eyebrow>
          <h1 className="rd-display mt-[13px] max-w-[17ch] text-[clamp(2.05rem,4.2vw,3.3rem)] leading-[1.02]">
            I build data platforms, and the{" "}
            <span className="text-[var(--rd-accent)]">AI agents</span> that run
            on top of them.
          </h1>
          <p className="rd-lead mt-6 max-w-[60ch] text-[clamp(1.05rem,1.5vw,1.22rem)]">
            I care about systems that are easy to operate, easy to explain, and
            boring in the places where reliability matters. Most of my work sits
            where data products, AI tooling, and engineering platforms meet —
            and most of it ends up open source.
          </p>
        </div>

        <VibeCodingBento agentsList={agentsList} />

        {/* Focus + Stack */}
        <div className="rd-g2 mt-3">
          <div className="rd-card p-[clamp(18px,2.2vw,26px)] p-[clamp(24px,3vw,34px)]">
            <Eyebrow>Focus</Eyebrow>
            <p className="mt-4 max-w-[34ch] text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.5] tracking-[-0.01em] text-[var(--rd-text-2)]">
              {focus}
            </p>
          </div>
          <div className="rd-card p-[clamp(18px,2.2vw,26px)] p-[clamp(24px,3vw,34px)]">
            <Eyebrow>Stack</Eyebrow>
            <p className="mt-4 text-[clamp(1.05rem,1.6vw,1.3rem)] leading-[1.5] tracking-[-0.01em] text-[var(--rd-text-2)]">
              {stack}
            </p>
          </div>
        </div>

        <TechStackGrid techStack={techStack} />
        <ElsewhereCards elsewhere={elsewhere} />
        <ExpertiseGrid
          expertise={expertise}
          experienceYears={experienceYears}
        />
      </div>
    </div>
  );
}
