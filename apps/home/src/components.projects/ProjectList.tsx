import { Link } from "@tanstack/react-router";
import { type AppItem } from "../data/projects";
import { addUtmParams } from "../../app/lib/utm";
import { Badge } from "../components/ui/badge";
import { categoryOf } from "./filter-utils";

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
              className="flex items-center gap-2 font-[var(--font-mono)] text-[var(--rd-text-3)] text-[12.5px] w-[200px] overflow-hidden text-ellipsis whitespace-nowrap shrink-0"
            >
              {item.logo && (
                <img
                  src={item.logo}
                  alt=""
                  width={14}
                  height={14}
                  className="shrink-0"
                />
              )}
              {item.domain || item.host}
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
