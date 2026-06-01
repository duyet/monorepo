import { ArrowUpRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { addUtmParams } from "../../app/lib/utm";
import { type AppItem } from "../data/projects";

interface WorkBentoProps {
  selectedProjects: { item: AppItem; tag: string }[];
}

export function WorkBento({ selectedProjects }: WorkBentoProps) {
  return (
    <div className="rd-work-grid">
      {selectedProjects.map(({ item, tag }) => {
        const href = addUtmParams(
          item.href,
          "homepage",
          item.utmContent,
          item.host,
        );
        return (
          <a
            key={item.name}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="rd-card flex flex-col p-4 min-h-[128px] no-underline text-inherit"
          >
            <div className="flex items-center justify-between gap-2.5">
              <span className="font-[var(--font-mono)] rd-work-dom">
                {item.domain || item.host}
              </span>
            </div>
            <h3 className="text-[1.02rem] tracking-[-0.03em] mt-2.5">{item.name}</h3>
            <p className="rd-work-desc">{item.description}</p>
            <div className="flex items-center justify-between mt-3">
              <Badge variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">{tag}</Badge>
              <span className="text-[var(--rd-text-4)]">
                <ArrowUpRight size={15} />
              </span>
            </div>
          </a>
        );
      })}
    </div>
  );
}
