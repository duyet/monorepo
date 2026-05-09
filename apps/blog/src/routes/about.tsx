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
  color: string;
}

function About() {
  const links: LinkItem[] = [
    {
      icon: ResumeIcon,
      title: "Resume",
      description:
        "Experience building scalable data infrastructure and leading engineering teams.",
      url: "https://cv.duyet.net",
      color: "bg-orange-100/50 dark:bg-[#4f2f1f]",
    },
    {
      icon: GithubIcon,
      title: "GitHub",
      description:
        "Open source contributions and personal projects in Python, Rust, and TypeScript.",
      url: "https://github.com/duyet",
      color: "bg-purple-100/50 dark:bg-[#2f1f3f]",
    },
    {
      icon: LinkedInIcon,
      title: "LinkedIn",
      description:
        "Professional network and career highlights in data engineering.",
      url: "https://linkedin.com/in/duyet",
      color: "bg-blue-100/50 dark:bg-[#1f2a3f]",
    },
    {
      icon: BlogIcon,
      title: "Blog Home",
      description:
        "Technical writings on data engineering, distributed systems, and open source.",
      url: "/",
      color: "bg-amber-100/60 dark:bg-[#3f2f1f]",
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
    <div className="mx-auto max-w-[1280px] px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
      {/* Header */}
      <div className="mx-auto mb-16 max-w-[820px] text-center sm:mb-24">
        <h1 className="mb-6 font-serif text-4xl tracking-[-0.5px] text-[var(--ink)] dark:text-[var(--on-dark)] sm:text-5xl lg:text-[56px] lg:tracking-[-1px]">
          About
        </h1>
        <p className="mx-auto max-w-3xl text-lg leading-relaxed text-[var(--body)] dark:text-[var(--muted)]">
          <strong className="font-medium text-[var(--body-strong)] dark:text-[var(--on-dark)]">
            Data Engineer
          </strong>{" "}
          with 6+ years of experience. I am confident in my knowledge of Data
          Engineering concepts, best practices and state-of-the-art data and
          Cloud technologies.
        </p>
      </div>

      {/* Links Grid */}
      <div className="mx-auto mb-16 grid max-w-[820px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {links.map((link, index) => {
          const Icon = link.icon;
          const isExternal = link.url.startsWith("http");
          return isExternal ? (
            <a
              key={index}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col p-10 ${link.color} rounded-xl transition-transform duration-200 hover:scale-[1.02]`}
            >
              <div className="mb-8 text-[#1a1a1a] dark:text-[#f8f8f2]">
                <Icon />
              </div>
              <h3 className="mb-3 text-xl font-medium text-[#1a1a1a] dark:text-[#f8f8f2]">
                {link.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
                {link.description}
              </p>
            </a>
          ) : (
            <Link
              key={index}
              to={link.url as "/"}
              className={`group flex flex-col p-10 ${link.color} rounded-xl transition-transform duration-200 hover:scale-[1.02]`}
            >
              <div className="mb-8 text-[#1a1a1a] dark:text-[#f8f8f2]">
                <Icon />
              </div>
              <h3 className="mb-3 text-xl font-medium text-[#1a1a1a] dark:text-[#f8f8f2]">
                {link.title}
              </h3>
              <p className="text-sm leading-relaxed text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
                {link.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* Skills Section */}
      <div className="mx-auto max-w-[820px] rounded-xl bg-[var(--surface-card)] p-8 dark:bg-[var(--surface-dark)] sm:p-12">
        <h2 className="mb-6 font-serif text-2xl tracking-[-0.3px] text-[var(--ink)] dark:text-[var(--on-dark)] sm:text-3xl">
          Skills & Stacks
        </h2>
        <div className="flex flex-wrap gap-3">
          {skills.map(({ name, link }) => (
            <span
              key={name}
              className="inline-block rounded-full bg-[var(--background-primary)] px-5 py-2 text-sm font-medium text-[var(--ink)] dark:bg-white/10 dark:text-[var(--on-dark-soft)]"
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
