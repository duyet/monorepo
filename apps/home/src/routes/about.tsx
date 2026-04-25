import Header from "@duyet/components/Header";
import { createFileRoute } from "@tanstack/react-router";
import { addUtmParams } from "../../app/lib/utm";

const profilePageJsonLd = JSON.stringify({
  "@context": "https://schema.org",
  "@type": "ProfilePage",
  dateCreated: "2020-01-01",
  dateModified: new Date().toISOString().split("T")[0],
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
    description:
      "Senior Data & AI Engineer with 6+ years of experience building scalable data infrastructure, AI/ML platforms, and distributed systems. Expertise in modern data warehousing, real-time processing, and cloud-native architectures.",
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
        content:
          "Senior Data & AI Engineer with 6+ years of experience building scalable data infrastructure, AI/ML platforms, and distributed systems. Expertise in modern data engineering, real-time processing, and cloud-native architectures.",
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

// Claude-style SVG Icons - minimal, geometric, soft
const ResumeIcon = () => (
  <svg
    aria-hidden="true"
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="24"
      y="16"
      width="32"
      height="48"
      rx="6"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    <circle
      cx="40"
      cy="30"
      r="6"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    <path
      d="M31 46C31 42 34 40 40 40C46 40 49 42 49 46"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="32"
      y1="54"
      x2="48"
      y2="54"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const GithubIcon = () => (
  <svg
    aria-hidden="true"
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="40"
      cy="38"
      r="18"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    <circle cx="33" cy="35" r="2.5" fill="currentColor" />
    <circle cx="47" cy="35" r="2.5" fill="currentColor" />
    <path
      d="M32 48C32 48 34 52 40 52C46 52 48 48 48 48"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M28 44V50C28 52 26 54 24 54"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <path
      d="M52 44V50C52 52 54 54 56 54"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

const LinkedInIcon = () => (
  <svg
    aria-hidden="true"
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="22"
      y="22"
      width="36"
      height="36"
      rx="8"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    <circle cx="32" cy="34" r="3" fill="currentColor" />
    <rect x="28" y="40" width="8" height="14" rx="1.5" fill="currentColor" />
    <rect x="40" y="40" width="8" height="14" rx="1.5" fill="currentColor" />
    <path
      d="M44 40V38C44 36 45 34 48 34C51 34 52 36 52 38V54"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  </svg>
);

const BlogIcon = () => (
  <svg
    aria-hidden="true"
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="24"
      y="20"
      width="32"
      height="40"
      rx="6"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    <line
      x1="32"
      y1="32"
      x2="48"
      y2="32"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="32"
      y1="40"
      x2="48"
      y2="40"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="32"
      y1="48"
      x2="42"
      y2="48"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
);

interface LinkItem {
  icon: () => React.JSX.Element;
  title: string;
  description: string;
  url: string;
  color: string;
}

function AboutPage() {
  const BLOG_URL =
    import.meta.env.VITE_DUYET_BLOG_URL || "https://blog.duyet.net";

  const links: LinkItem[] = [
    {
      icon: ResumeIcon,
      title: "Resume",
      description:
        "Experience building scalable data infrastructure and leading engineering teams.",
      url: addUtmParams("https://cv.duyet.net", "about_page", "resume_card"),
      color: "bg-orange-100/50",
    },
    {
      icon: GithubIcon,
      title: "GitHub",
      description:
        "Open source contributions and personal projects in Python, Rust, and TypeScript.",
      url: addUtmParams(
        "https://github.com/duyet",
        "about_page",
        "github_card"
      ),
      color: "bg-purple-100/50",
    },
    {
      icon: LinkedInIcon,
      title: "LinkedIn",
      description:
        "Professional network and career highlights in data engineering.",
      url: addUtmParams(
        "https://linkedin.com/in/duyet",
        "about_page",
        "linkedin_card"
      ),
      color: "bg-blue-100/50",
    },
    {
      icon: BlogIcon,
      title: "Blog",
      description:
        "Technical writings on data engineering, distributed systems, and open source.",
      url: addUtmParams(BLOG_URL, "about_page", "blog_card"),
      color: "bg-amber-100/60",
    },
  ];

  const skills = [
    {
      name: "Python",
      link: addUtmParams(
        "https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=python",
        "about_page",
        "skill_python"
      ),
    },
    {
      name: "Rust",
      link: addUtmParams(
        "https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=rust",
        "about_page",
        "skill_rust"
      ),
    },
    {
      name: "Javascript",
      link: addUtmParams(
        "https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=javascript",
        "about_page",
        "skill_javascript"
      ),
    },
    { name: "Spark" },
    {
      name: "Airflow",
      link: addUtmParams(
        `${BLOG_URL}/tag/airflow/`,
        "about_page",
        "skill_airflow"
      ),
    },
    { name: "AWS" },
    { name: "GCP" },
  ];

  return (
    <>
      <Header shortText="Duyệt" />
      <div className="min-h-screen bg-neutral-50">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="mb-6 font-serif text-5xl font-normal text-neutral-900 sm:text-6xl">
              About
            </h1>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-neutral-700">
              Data Engineer with 6+ years of experience. I am confident in my
              knowledge of Data Engineering concepts, best practices and
              state-of-the-art data and Cloud technologies.
            </p>
          </div>

          {/* Links Grid */}
          <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.title}
                  href={link.url}
                  target={link.url.startsWith("http") ? "_blank" : undefined}
                  rel={
                    link.url.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className={`group flex flex-col p-10 ${link.color} rounded-3xl transition-transform duration-200 hover:scale-[1.02]`}
                >
                  <div className="mb-8 text-neutral-800">
                    <Icon />
                  </div>
                  <p className="mb-3 text-xl font-medium text-neutral-900">
                    {link.title}
                  </p>
                  <p className="text-sm leading-relaxed text-neutral-700">
                    {link.description}
                  </p>
                </a>
              );
            })}
          </div>

          {/* Skills Section */}
          <div className="rounded-3xl bg-stone-100/70 p-8 sm:p-12">
            <h2 className="mb-6 font-serif text-3xl font-normal text-neutral-900">
              Skills & Stacks
            </h2>
            <div className="flex flex-wrap gap-3">
              {skills.map(({ name, link }) =>
                link ? (
                  <a
                    key={name}
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-full bg-neutral-50 px-5 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 hover:text-neutral-900"
                  >
                    {name}
                  </a>
                ) : (
                  <span
                    key={name}
                    className="inline-block rounded-full bg-neutral-50 px-5 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100"
                  >
                    {name}
                  </span>
                )
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
