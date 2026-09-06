import { addUtmParams } from "../../app/lib/utm";
import { ColoredDomain } from "../components.projects/ColoredDomain";
import type { AppItem } from "../data/projects";

interface ProjectCardHeaderProps {
  item: AppItem;
  titleClass?: string;
  utm?: { source: string; content?: string; medium?: string };
}

function Logo({
  logo,
  logoDark,
}: {
  logo?: string;
  logoDark?: string;
}) {
  if (!logo && !logoDark) return null;
  if (logoDark) {
    return (
      <>
        <img src={logo} alt="" className="home-proj-logo dark:hidden" />
        <img
          src={logoDark}
          alt=""
          className="home-proj-logo hidden dark:block"
        />
      </>
    );
  }
  return <img src={logo} alt="" className="home-proj-logo" />;
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
    <div className="home-proj-head">
      <Logo logo={item.logo} logoDark={item.logoDark} />
      <div className="min-w-0 flex flex-col gap-0.5">
        <a {...linkProps} className="home-proj-domain">
          <ColoredDomain domain={item.domain || item.host} />
        </a>
        <a {...linkProps} className={`home-proj-title ${titleClass}`}>
          {item.name}
        </a>
      </div>
    </div>
  );
}
