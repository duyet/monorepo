import { cn } from "@duyet/libs/utils";
import { CategoryHeader } from "./CategoryHeader";
import { ExternalIcon } from "./icons";
import type { UrlEntry } from "./types";

interface UrlsListViewProps {
  filteredUrls: UrlEntry[];
  grouped: Map<string, UrlEntry[]>;
  searchQuery: string;
}

export function UrlsListView({ filteredUrls, grouped, searchQuery }: UrlsListViewProps) {
  if (searchQuery) {
    return (
      <div className="border-y">
        {filteredUrls.map(({ path, target, desc }) => {
          const isExternal = target.startsWith("http");
          return (
            <a
              key={path}
              href={target}
              target={isExternal ? "_blank" : undefined}
              rel={isExternal ? "noopener noreferrer" : undefined}
              className="flex flex-col gap-1.5 border-t py-4 text-foreground no-underline first:border-t-0"
            >
              <div className="flex items-center gap-2">
                <code className="font-mono text-[13px] font-semibold">
                  {path}
                </code>
                {isExternal && <ExternalIcon className="h-3.5 w-3.5 text-muted-foreground" />}
              </div>
              {desc && <p className="m-0 text-[13px] text-muted-foreground">{desc}</p>}
              <div className="mt-1 flex items-center gap-1.5">
                <svg aria-hidden="true" className="h-3 w-3 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="truncate font-mono text-[11px] text-muted-foreground">{target}</span>
              </div>
            </a>
          );
        })}
      </div>
    );
  }

  return (
    <div>
      {Array.from(grouped.entries()).map(([category, entries]) => (
        <div key={category} className="mb-8">
          <CategoryHeader category={category} count={entries.length} />
          <div className="border-y">
            {entries.map(({ path, target, desc }, i) => {
              const isExternal = target.startsWith("http");
              return (
                <a
                  key={path}
                  href={target}
                  target={isExternal ? "_blank" : undefined}
                  rel={isExternal ? "noopener noreferrer" : undefined}
                  className={cn(
                    "flex items-center gap-4 px-5 py-3 no-underline text-foreground transition-colors hover:bg-muted duration-150",
                    i === 0 ? "" : "border-t"
                  )}
                >
                  <code className="w-[120px] shrink-0 font-mono text-[13px] font-semibold">
                    {path}
                  </code>
                  <p className="m-0 hidden flex-1 truncate text-[13px] text-muted-foreground sm:block">
                    {desc ?? <span className="text-muted-foreground">&mdash;</span>}
                  </p>
                  <span className="hidden max-w-[200px] truncate font-mono text-[11px] text-muted-foreground sm:block">
                    {target}
                  </span>
                  <svg aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
