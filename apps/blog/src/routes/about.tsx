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
      color: "bg-orange-100/50",
    },
    {
      icon: GithubIcon,
      title: "GitHub",
      description:
        "Open source contributions and personal projects in Python, Rust, and TypeScript.",
      url: "https://github.com/duyet",
      color: "bg-purple-100/50",
    },
    {
      icon: LinkedInIcon,
      title: "LinkedIn",
      description:
        "Professional network and career highlights in data engineering.",
      url: "https://linkedin.com/in/duyet",
      color: "bg-blue-100/50",
    },
    {
      icon: BlogIcon,
      title: "Blog Home",
      description:
        "Technical writings on data engineering, distributed systems, and open source.",
      url: "/",
      color: "bg-amber-100/60",
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
    <div className="min-h-screen bg-neutral-50 dark:bg-transparent">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-6 font-serif text-5xl font-normal text-neutral-900 dark:text-neutral-100 sm:text-6xl">
            About
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-neutral-700 dark:text-neutral-300">
            <strong className="font-semibold text-neutral-900 dark:text-neutral-100">
              Data Engineer
            </strong>{" "}
            with 6+ years of experience. I am confident in my knowledge of Data
            Engineering concepts, best practices and state-of-the-art data and
            Cloud technologies.
          </p>
        </div>

        {/* Links Grid */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link, index) => {
            const Icon = link.icon;
            const isExternal = link.url.startsWith("http");
            return isExternal ? (
              <a
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col p-10 ${link.color} rounded-3xl transition-transform duration-200 hover:scale-[1.02]`}
              >
                <div className="mb-8 text-neutral-800 dark:text-neutral-200">
                  <Icon />
                </div>
                <h3 className="mb-3 text-xl font-medium text-neutral-900 dark:text-neutral-100">
                  {link.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                  {link.description}
                </p>
              </a>
            ) : (
              <Link
                key={index}
                to={link.url as "/"}
                className={`group flex flex-col p-10 ${link.color} rounded-3xl transition-transform duration-200 hover:scale-[1.02]`}
              >
                <div className="mb-8 text-neutral-800">
                  <Icon />
                </div>
                <h3 className="mb-3 text-xl font-medium text-neutral-900">
                  {link.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-700">
                  {link.description}
                </p>
              </Link>
            );
          })}
        </div>

        {/* Skills Section */}
        <div className="rounded-3xl bg-stone-100/70 dark:bg-neutral-800/50 p-8 sm:p-12">
          <h2 className="mb-6 font-serif text-3xl font-normal text-neutral-900 dark:text-neutral-100">
            Skills & Stacks
          </h2>
          <div className="flex flex-wrap gap-3">
            {skills.map(({ name, link }) => (
              <span
                key={name}
                className="inline-block rounded-full bg-neutral-50 dark:bg-neutral-700 px-5 py-2 text-sm font-medium text-neutral-800 dark:text-neutral-200 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-600"
              >
                {link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neutral-900 dark:hover:text-neutral-100"
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
    </div>
  );
}
