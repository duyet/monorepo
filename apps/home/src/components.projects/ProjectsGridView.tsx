import { CategoryHeader } from "../components/urls/CategoryHeader";
import type { AppItem } from "../data/projects";
import { ProjectCardRow } from "./ProjectCardRow";

export function ProjectsGridView({
  grouped,
}: {
  grouped: Map<string, AppItem[]>;
}) {
  return (
    <div>
      {Array.from(grouped.entries()).map(([category, entries]) => (
        <div key={category} className="mb-8">
          <CategoryHeader category={category} count={entries.length} />
          <div className="border-y">
            {entries.map((item) => (
              <ProjectCardRow key={item.name} item={item} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
