import { createFileRoute, Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import {
  BarChart2,
  Bot,
  BookOpen,
  BrainCircuit,
  Cloud,
  Code2,
  Database,
  GitBranch,
  GitFork,
  Globe,
  Link as LinkIcon,
  Package,
  Plug,
  Puzzle,
  Rss,
  Share2,
  Star,
  Terminal,
  Type,
} from "lucide-react";
import { addUtmParams } from "../../app/lib/utm";
import { apps, type AppItem } from "../data/projects";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      { title: "Projects | Duyet Le" },
      {
        name: "description",
        content:
          "A complete list of Duyet Le projects, apps, dashboards, AI tools, and open source work.",
      },
    ],
  }),
});

const ICON_MAP: Record<string, ReactNode> = {
  BarChart2: <BarChart2 size={18} />,
  Bot: <Bot size={18} />,
  BookOpen: <BookOpen size={18} />,
  BrainCircuit: <BrainCircuit size={18} />,
  Cloud: <Cloud size={18} />,
  Code2: <Code2 size={18} />,
  Database: <Database size={18} />,
  GitBranch: <GitBranch size={18} />,
  Github: <GitFork size={18} />,
  Globe: <Globe size={18} />,
  Link: <LinkIcon size={18} />,
  Package: <Package size={18} />,
  Plug: <Plug size={18} />,
  Puzzle: <Puzzle size={18} />,
  Rss: <Rss size={18} />,
  Share2: <Share2 size={18} />,
  Star: <Star size={18} />,
  Terminal: <Terminal size={18} />,
  Type: <Type size={18} />,
};

function projectIcon(item: AppItem): ReactNode {
  if (item.iconName && ICON_MAP[item.iconName]) {
    return ICON_MAP[item.iconName];
  }
  if (item.host === "github.com") {
    return ICON_MAP.Github;
  }
  return ICON_MAP.Globe;
}

function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">

      <main className="mx-auto max-w-[1040px] px-6 py-12 md:py-16 md:px-8">
        <header className="mb-12">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Directory · {apps.length} projects
          </p>
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mt-3">
            Projects
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground leading-relaxed">
            A complete list of public project surfaces across data engineering,
            AI infrastructure, analytics, and developer tooling.
          </p>
        </header>

        <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border border">
          {apps.map((item) => (
            <li key={item.name} className="bg-background">
              <ProjectLink item={item}>
                <article className="flex h-full flex-col gap-2 p-5 transition-colors hover:bg-muted">
                  <span className="text-muted-foreground">
                    {projectIcon(item)}
                  </span>
                  <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                    {item.domain || item.host}
                  </p>
                  <h2 className="text-base font-medium tracking-tight">
                    {item.name}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                    {item.description}
                  </p>
                </article>
              </ProjectLink>
            </li>
          ))}
        </ul>
      </main>

    </div>
  );
}

function ProjectLink({
  item,
  children,
}: {
  item: AppItem;
  children: ReactNode;
}) {
  const href = addUtmParams(item.href, "projects", item.utmContent, item.host);

  if (href.startsWith("http")) {
    return (
      <a
        href={href}
        className="block h-full no-underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }

  return (
    <Link to={href} className="block h-full no-underline">
      {children}
    </Link>
  );
}
