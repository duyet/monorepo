import { ArrowIcon, ExternalIcon } from "../components/urls/icons";
import type { AppItem } from "../data/projects";
import { listingPath, listingTarget } from "./filter-utils";
import { isExternalHref, projectHref } from "./project-href";

export function ProjectCardRow({ item }: { item: AppItem }) {
  const href = projectHref(item);
  const external = isExternalHref(href);
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex flex-col gap-2 border-t py-4 text-foreground no-underline transition-colors first:border-t-0 hover:text-muted-foreground"
    >
      <div className="flex items-center justify-between">
        <code className="font-mono text-[15px] font-semibold">
          {listingPath(item)}
        </code>
        {external ? (
          <ExternalIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        ) : null}
      </div>
      <p className="m-0 text-[13px] leading-snug text-muted-foreground">
        {item.description}
      </p>
      <p className="m-0 flex items-center gap-1.5 truncate font-mono text-[11px] text-muted-foreground">
        <ArrowIcon className="h-3 w-3 shrink-0" />
        {listingTarget(item)}
      </p>
    </a>
  );
}
