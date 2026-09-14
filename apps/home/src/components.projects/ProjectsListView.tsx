import { CategoryHeader } from "../components/urls/CategoryHeader";
import type { AppItem } from "../data/projects";
import { ProjectListRow } from "./ProjectListRow";
import { ProjectSearchHit } from "./ProjectSearchHit";

export function ProjectsListView({
  items,
  grouped,
  searchQuery,
}: {
  items: AppItem[];
  grouped: Map<string, AppItem[]>;
  searchQuery: string;
}) {
  if (searchQuery) {
    return (
      <div className="border-y">
        {items.map((item) => (
          <ProjectSearchHit key={item.name} item={item} />
        ))}
      </div>
    );
  }

  return (
    <div>
      {Array.from(grouped.entries()).map(([category, entries]) => (
        <div key={category} className="mb-8">
          <CategoryHeader category={category} count={entries.length} />
          <div className="border-y">
            {entries.map((item, i) => (
              <ProjectListRow key={item.name} item={item} first={i === 0} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
