import { type AppItem } from "../data/projects";
import { ColoredDomain } from "../components.projects/ColoredDomain";
import { addUtmParams } from "../../app/lib/utm";

interface ProjectCardHeaderProps {
  item: AppItem;
  titleClass: string;
  /** UTM params: source, content, medium host. */
  utm?: { source: string; content?: string; medium?: string };
}

function Logo({ logo, logoDark, className = "" }: { logo?: string; logoDark?: string; className?: string }) {
  if (!logo && !logoDark) return null;
  if (logoDark) {
    return (
      <picture>
        <source media="(prefers-color-scheme: dark)" srcSet={logoDark} />
        <img src={logo} alt="" className={className} />
      </picture>
    );
  }
  return <img src={logo} alt="" className={className} />;
}

export function ProjectCardHeader({
  item,
  titleClass,
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
    <div
      className={
        item.logo || item.logoDark
          ? "grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 items-center"
          : "flex flex-col gap-1"
      }
    >
      <Logo
        logo={item.logo}
        logoDark={item.logoDark}
        className="shrink-0 rounded row-span-2 self-start w-[50px] h-auto max-h-[50px] object-contain"
      />
      <a
        {...linkProps}
        className="font-[var(--font-mono)] text-[13px] font-medium tracking-[-0.01em] min-w-0 overflow-hidden text-ellipsis whitespace-nowrap no-underline text-inherit hover:opacity-70 transition-opacity"
      >
        <ColoredDomain domain={item.domain || item.host} />
      </a>
      <a
        {...linkProps}
        className={`${titleClass} tracking-[-0.03em] leading-tight no-underline text-inherit hover:opacity-70 transition-opacity`}
      >
        {item.name}
      </a>
    </div>
  );
}
