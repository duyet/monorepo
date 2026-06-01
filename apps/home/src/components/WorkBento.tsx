import { ArrowUpRight } from "lucide-react";
import { Badge } from "./ui/badge";
import { addUtmParams } from "../../app/lib/utm";
import { type AppItem } from "../data/projects";
import { ColoredDomain } from "../components.projects/ColoredDomain";

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
            <div className={item.logo ? "grid grid-cols-[auto_1fr] gap-x-3 items-center" : ""}>
              {item.logo && (
                <img
                  src={item.logo}
                  alt=""
                  className="shrink-0 rounded row-span-2 self-start mt-0.5 w-[24px] h-[24px] object-contain"
                />
              )}
              <span className="font-[var(--font-mono)] text-[11px]">
                <ColoredDomain domain={item.domain || item.host} />
              </span>
              <h3 className="text-[1.02rem] tracking-[-0.03em] leading-tight">{item.name}</h3>
            </div>
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
