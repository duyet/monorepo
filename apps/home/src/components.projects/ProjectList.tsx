import { Link } from "@tanstack/react-router";
import { type AppItem } from "../data/projects";
import { addUtmParams } from "../../app/lib/utm";
import { Badge } from "../components/ui/badge";
import { categoryOf } from "./filter-utils";
import { ColoredDomain } from "./ColoredDomain";

function Logo({ logo, logoDark, size = 28 }: { logo?: string; logoDark?: string; size?: number }) {
  if (!logo && !logoDark) return null;
  if (logoDark) {
    return (
      <picture>
        <source media="(prefers-color-scheme: dark)" srcSet={logoDark} />
        <img src={logo} alt="" width={size} height={size} className="shrink-0 rounded" />
      </picture>
    );
  }
  return <img src={logo} alt="" width={size} height={size} className="shrink-0 rounded" />;
}

export function ProjectList({ items }: { items: AppItem[] }) {
  return (
    <div className="rd-rows">
      {items.map((item) => {
        const href = addUtmParams(
          item.href,
          "projects",
          item.utmContent,
          item.host,
        );
        const isExternal = href.startsWith("http");
        const inner = (
          <>
            <span
              className="flex flex-col gap-1 w-[200px] shrink-0"
            >
              <Logo logo={item.logo} logoDark={item.logoDark} size={28} />
              <span className="font-[var(--font-mono)] text-[12.5px] overflow-hidden text-ellipsis whitespace-nowrap">
                <ColoredDomain domain={item.domain || item.host} />
              </span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="font-semibold mr-3 tracking-[-0.02em]">
                {item.name}
              </span>
              <span className="text-[var(--rd-text-2)] text-sm">
                {item.description}
              </span>
            </span>
            <div className="flex gap-1 shrink-0">
              {item.tags?.map((tag) => (
                <Badge key={tag} variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">{tag}</Badge>
              ))}
            </div>
          </>
        );

        const rowClass = "rd-row flex items-center gap-4 no-underline text-inherit cursor-pointer";

        return isExternal ? (
          <a
            key={item.name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={rowClass}
          >
            {inner}
          </a>
        ) : (
          <Link
            key={item.name}
            to={href}
            className={rowClass}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
