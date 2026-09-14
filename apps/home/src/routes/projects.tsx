import { createFileRoute } from "@tanstack/react-router";
import { ProjectsCatalog } from "../components.projects/ProjectsCatalog";
import { ProjectsPageHeader } from "../components.projects/ProjectsPageHeader";
import { apps } from "../data/projects";

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
    links: [{ rel: "canonical", href: "https://duyet.net/projects" }],
  }),
});

function ProjectsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto max-w-[1200px] px-6 pt-24 pb-20 md:px-8 md:pt-32 md:pb-32">
        <ProjectsPageHeader count={apps.length} />
        <div className="mt-16">
          <ProjectsCatalog />
        </div>
      </main>
    </div>
  );
}
