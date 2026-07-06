import { CategoryHeader } from "./CategoryHeader";
import type { UrlEntry } from "./types";
import { UrlRow } from "./UrlRow";

interface UrlsGridViewProps {
  grouped: Map<string, UrlEntry[]>;
}

export function UrlsGridView({ grouped }: UrlsGridViewProps) {
  return (
    <div>
      {Array.from(grouped.entries()).map(([category, entries]) => (
        <div key={category} className="mb-8">
          <CategoryHeader category={category} count={entries.length} />
          <div className="border-y">
            {entries.map((entry) => (
              <UrlRow key={entry.path} {...entry} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
