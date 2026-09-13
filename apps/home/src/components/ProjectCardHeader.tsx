import { addUtmParams } from "../../app/lib/utm";
import { ColoredDomain } from "../components.projects/ColoredDomain";
import type { AppItem } from "../data/projects";
import { ProjectMark } from "./ProjectMark";

interface ProjectCardHeaderProps {
  item: AppItem;
  titleClass?: string;
  utm?: { source: string; content?: string; medium?: string };
}

export function ProjectCardHeader({
  item,
  titleClass = "text-[1.05rem]",
  utm,
}: ProjectCardHeaderProps) {
  const href = utm
    ? addUtmParams(item.href, utm.source, utm.content, utm.medium)
    : item.href;
  const isExternal = href.startsWith("http");
  const linkProps = isExternal
    ? { href, target: "_blank" as const, rel: "noopener noreferrer" }
    : { href };

  return (
    <div className="flex items-center gap-3">
      <ProjectMark
        item={item}
        size={40}
        className="h-10 w-10 shrink-0 overflow-hidden rounded-lg [&>img]:h-10 [&>img]:w-10 [&>img]:object-contain [&>svg]:h-10 [&>svg]:w-10"
      />
      <div className="min-w-0 flex flex-col gap-0.5">
        <a
          {...linkProps}
          className="font-[family-name:var(--font-mono)] text-[0.72rem] text-[var(--rd-text-3)] no-underline"
        >
          <ColoredDomain domain={item.domain || item.host} />
        </a>
        <a
          {...linkProps}
          className={`font-medium tracking-[-0.02em] text-[var(--rd-text)] no-underline hover:text-[var(--rd-accent-ink)] ${titleClass}`}
        >
          {item.name}
        </a>
      </div>
    </div>
  );
}
