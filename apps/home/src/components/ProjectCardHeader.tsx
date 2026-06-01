import { type AppItem } from "../data/projects";
import { ColoredDomain } from "../components.projects/ColoredDomain";

interface ProjectCardHeaderProps {
  item: AppItem;
  /** Title font size. Defaults to "text-[1.1rem]". */
  titleClass?: string;
}

export function ProjectCardHeader({
  item,
  titleClass = "text-[1.1rem]",
}: ProjectCardHeaderProps) {
  return (
    <div className={item.logo ? "grid grid-cols-[auto_1fr] gap-x-3 items-center" : ""}>
      {item.logo && (
        <img
          src={item.logo}
          alt=""
          className="shrink-0 rounded row-span-2 self-start w-[50px] h-auto max-h-[50px] object-contain"
        />
      )}
      <span className="font-[var(--font-mono)] text-[13px]">
        <ColoredDomain domain={item.domain || item.host} />
      </span>
      <h3 className={`${titleClass} tracking-[-0.03em] leading-tight`}>
        {item.name}
      </h3>
    </div>
  );
}
