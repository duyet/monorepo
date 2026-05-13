import { createFileRoute, Link } from "@tanstack/react-router";
import {
  BlogIcon,
  GithubIcon,
  LinkedInIcon,
  ResumeIcon,
} from "@/components/icons";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About | Tôi là Duyệt" },
      { name: "description", content: "About Duyet Le — Sr. Data Engineer." },
    ],
  }),
  component: About,
});

interface LinkItem {
  icon: () => React.JSX.Element;
  title: string;
  description: string;
  url: string;
}

function About() {
  const links: LinkItem[] = [
    {
      icon: ResumeIcon,
      title: "Resume",
      description:
        "Experience building scalable data infrastructure and leading engineering teams.",
      url: "https://cv.duyet.net",
    },
    {
      icon: GithubIcon,
      title: "GitHub",
      description:
        "Open source contributions and personal projects in Python, Rust, and TypeScript.",
      url: "https://github.com/duyet",
    },
    {
      icon: LinkedInIcon,
      title: "LinkedIn",
      description:
        "Professional network and career highlights in data engineering.",
      url: "https://linkedin.com/in/duyet",
    },
    {
      icon: BlogIcon,
      title: "Blog Home",
      description:
        "Technical writings on data engineering, distributed systems, and open source.",
      url: "/",
    },
  ];

  const skills = [
    {
      name: "Python",
      link: "https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=python",
    },
    {
      name: "Rust",
      link: "https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=rust",
    },
    {
      name: "Javascript",
      link: "https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=javascript",
    },
    { name: "Spark" },
    { name: "Airflow", link: "https://blog.duyet.net/tag/airflow/" },
    { name: "AWS" },
    { name: "GCP" },
  ];

  return (
    <div className="mx-auto max-w-[1180px] px-5 py-12 sm:px-8 sm:py-16 lg:px-10">
      <div className="blog-page-head mb-12 max-w-[760px]">
        <h1>
          About
        </h1>
        <p>
          <strong className="font-medium text-[var(--body-strong)] dark:text-[var(--on-dark)]">
            Data Engineer
          </strong>{" "}
          with 6+ years of experience. I am confident in my knowledge of Data
          Engineering concepts, best practices and state-of-the-art data and
          Cloud technologies.
        </p>
      </div>

      <div className="blog-link-grid mb-16">
        {links.map((link, index) => {
          const Icon = link.icon;
          const isExternal = link.url.startsWith("http");
          return isExternal ? (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <div>
                <div className="mb-6 text-[#1a1a1a] dark:text-[#f8f8f2]">
                  <Icon />
                </div>
                <h3>{link.title}</h3>
                <p>{link.description}</p>
              </div>
              <span className="meta">Open →</span>
            </a>
          ) : (
            <Link
              key={index}
              to={link.url as "/"}
            >
              <div>
                <div className="mb-6 text-[#1a1a1a] dark:text-[#f8f8f2]">
                  <Icon />
                </div>
                <h3>{link.title}</h3>
                <p>{link.description}</p>
              </div>
              <span className="meta">Open →</span>
            </Link>
          );
        })}
      </div>

      <div className="border-y border-[var(--border-faint)] py-8">
        <h2 className="mb-6 text-2xl font-semibold tracking-[-0.02em] text-[var(--ink)] dark:text-[var(--on-dark)]">
          Skills & Stacks
        </h2>
        <div className="flex flex-wrap gap-3">
          {skills.map(({ name, link }) => (
            <span
              key={name}
              className="inline-block rounded-lg border border-[var(--border-faint)] px-3 py-2 text-sm font-medium text-[var(--ink)] dark:bg-white/10 dark:text-[var(--on-dark-soft)]"
            >
              {link ? (
                <a
                  href={link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[var(--muted)] dark:hover:text-[var(--on-dark)]"
                >
                  {name}
                </a>
              ) : (
                name
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
