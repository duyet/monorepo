import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
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
    title: "Blog home",
    description:
      "Technical writing on data engineering, distributed systems, and open source.",
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

function About(): ReactElement {
  return (
    <div className="px-6 md:px-8">
      <header className="em-masthead">
        <span className="em-masthead__eyebrow">Colophon</span>
        <h1 className="em-masthead__title">About</h1>
        <p className="em-masthead__dek">
          Data engineer with 6+ years of experience. Comfortable across data
          engineering concepts, best practices, and modern cloud platforms.
        </p>
      </header>

      <section
        className="mx-auto max-w-2xl"
        aria-label="Profile links"
      >
        {links.map((link, i) => {
          const Icon = link.icon;
          const isExternal = link.url.startsWith("http");
          const style: CSSProperties = { animationDelay: `${i * 50}ms` };
          const content = (
            <>
              <div className="flex items-baseline justify-between gap-3">
                <span className="em-index__name flex items-center gap-3">
                  <Icon />
                  {link.title}
                </span>
                <span className="em-index__count">
                  {isExternal ? "External →" : "Open →"}
                </span>
              </div>
              <p className="mt-1 text-[13px] leading-relaxed text-[color:var(--em-muted)]">
                {link.description}
              </p>
            </>
          );
          return isExternal ? (
            <a
              key={link.title}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="em-index__row editorial-enter block"
              style={style}
            >
              {content}
            </a>
          ) : (
            <Link
              key={link.title}
              to={link.url as "/"}
              className="em-index__row editorial-enter block"
              style={style}
            >
              {content}
            </Link>
          );
        })}
      </section>

      <section
        className="mx-auto mt-16 max-w-2xl"
        aria-label="Skills and stacks"
      >
        <h2 className="font-editorial-serif mb-4 text-2xl font-medium text-[color:var(--em-foreground)]">
          Skills &amp; stacks
        </h2>
        <p className="text-sm leading-relaxed text-[color:var(--em-muted)]">
          {skills.map((s, i) => (
            <span key={s.name}>
              {s.link ? (
                <a
                  href={s.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[color:var(--em-foreground)] underline decoration-[color:var(--em-hairline)] decoration-1 underline-offset-4 transition-colors hover:decoration-[color:var(--em-accent)]"
                >
                  {s.name}
                </a>
              ) : (
                <span className="text-[color:var(--em-foreground)]">
                  {s.name}
                </span>
              )}
              {i < skills.length - 1 && (
                <span className="text-[color:var(--em-subtle)]"> · </span>
              )}
            </span>
          ))}
        </p>
      </section>
    </div>
  );
}
