import { ArrowIcon, ExternalIcon } from "../components/urls/icons";
import type { AppItem } from "../data/projects";
import { listingPath, listingTarget } from "./filter-utils";
import { isExternalHref, projectHref } from "./project-href";

export function ProjectSearchHit({ item }: { item: AppItem }) {
  const href = projectHref(item);
  const external = isExternalHref(href);
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex flex-col gap-1.5 border-t py-4 text-foreground no-underline first:border-t-0"
    >
      <div className="flex items-center gap-2">
        <code className="font-mono text-[13px] font-semibold">
          {listingPath(item)}
        </code>
        {external ? (
          <ExternalIcon className="h-3.5 w-3.5 text-muted-foreground" />
        ) : null}
      </div>
      <p className="m-0 text-[13px] text-muted-foreground">{item.description}</p>
      <div className="mt-1 flex items-center gap-1.5">
        <ArrowIcon className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="truncate font-mono text-[11px] text-muted-foreground">
          {listingTarget(item)}
        </span>
      </div>
    </a>
  );
}
