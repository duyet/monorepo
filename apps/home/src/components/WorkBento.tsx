import { Badge } from "./ui/badge";
import { type AppItem } from "../data/projects";
import { ProjectCardHeader } from "./ProjectCardHeader";

interface WorkBentoProps {
  selectedProjects: { item: AppItem; tag: string }[];
}

export function WorkBento({ selectedProjects }: WorkBentoProps) {
  return (
    <div className="rd-work-grid">
      {selectedProjects.map(({ item, tag }) => (
        <div
          key={item.name}
          className="rd-card flex flex-col p-4 min-h-[128px] text-inherit"
        >
          <ProjectCardHeader
            item={item}
            titleClass="text-[1.02rem]"
            utm={{ source: "homepage", content: item.utmContent, medium: item.host }}
          />
          <p className="rd-work-desc">{item.description}</p>
          <div className="flex items-center justify-between mt-3">
            <Badge variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">{tag}</Badge>
          </div>
        </div>
      ))}
    </div>
  );
}
