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

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      <main className="mx-auto max-w-5xl px-6 py-12 md:py-20">
        <article className="flex flex-col gap-6">
          <header>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Biography
            </p>
            <h1 className="mt-2 text-3xl md:text-4xl font-semibold tracking-tight">
              About
            </h1>
          </header>

          <p className="text-base md:text-lg leading-relaxed">
            I'm a Senior Data &amp; AI Engineer with {experienceYears} of
            experience across modern data infrastructure, AI/ML platforms, and
            distributed systems.
          </p>

          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            I care about systems that are easy to operate, easy to explain, and
            boring in the places where reliability matters. Most of my work sits
            where data products, AI tools, and engineering platforms meet.
          </p>

          <h2 className="mt-6 text-lg font-semibold tracking-tight border-b pb-2">
            Focus
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Data pipelines, warehouses, observability. Agent workflows, model
            routing, evaluation, and usage analytics. Small tools and clean
            interfaces.
          </p>

          <h2 className="mt-6 text-lg font-semibold tracking-tight border-b pb-2">
            Stack
          </h2>
          <p className="text-sm md:text-base leading-relaxed text-muted-foreground">
            Python, Rust, TypeScript. Spark, Airflow, ClickHouse, BigQuery,
            Kafka. Kubernetes, AWS, GCP, Cloudflare. LlamaIndex, AI SDK,
            LangGraph.
          </p>

          <h2 className="mt-6 text-lg font-semibold tracking-tight border-b pb-2">
            Elsewhere
          </h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-px bg-border border">
            {links.map((item) => (
              <li key={item.title} className="bg-background">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full p-5 no-underline transition-colors hover:bg-muted"
                >
                  <h3 className="text-base font-medium tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </a>
              </li>
            ))}
          </ul>

          <div className="mt-12 pt-12 border-t">
            <AreasOfExpertise areas={DEFAULT_AREAS} />
          </div>
        </article>
      </main>

    </div>
  );
}
