import { Reveal } from "@duyet/components";
import { type AppItem } from "../data/projects";
import { Badge } from "../components/ui/badge";
import { categoryOf } from "./filter-utils";
import { ProjectCardHeader } from "../components/ProjectCardHeader";

export function ProjectGrid({ items }: { items: AppItem[] }) {
  return (
    <div className="rd-work-grid">
      {items.map((item, i) => {
        const cat = categoryOf(item);

        return (
          <Reveal key={item.name} delay={i * 25}>
            <div className="rd-card flex flex-col p-4 min-h-[176px] text-inherit h-full">
              <ProjectCardHeader
                item={item}
                titleClass="text-[1.18rem]"
                utm={{ source: "projects", content: item.utmContent, medium: item.host }}
              />
              <p className="rd-work-desc">{item.description}</p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-1 flex-wrap">
                  {item.tags?.map((tag) => (
                    <Badge key={tag} variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">{tag}</Badge>
                  ))}
                  <Badge variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">{cat}</Badge>
                </div>
              </div>
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}
