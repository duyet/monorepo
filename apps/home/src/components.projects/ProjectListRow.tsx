import { cn } from "@duyet/libs/utils";
import { ChevronIcon, ExternalIcon } from "../components/urls/icons";
import type { AppItem } from "../data/projects";
import { listingPath, listingTarget } from "./filter-utils";
import { isExternalHref, projectHref } from "./project-href";

export function ProjectListRow({
  item,
  first,
}: {
  item: AppItem;
  first?: boolean;
}) {
  const href = projectHref(item);
  const external = isExternalHref(href);
  return (
    <a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={cn(
        "flex items-center gap-4 px-5 py-3 text-foreground no-underline transition-colors duration-150 hover:bg-muted",
        first ? "" : "border-t",
      )}
    >
      <code className="w-[140px] shrink-0 font-mono text-[13px] font-semibold">
        {listingPath(item)}
      </code>
      <p className="m-0 hidden flex-1 truncate text-[13px] text-muted-foreground sm:block">
        {item.description}
      </p>
      <span className="hidden max-w-[200px] truncate font-mono text-[11px] text-muted-foreground sm:block">
        {listingTarget(item)}
      </span>
      {external ? (
        <ExternalIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      ) : (
        <ChevronIcon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      )}
    </a>
  );
}
