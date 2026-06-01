import { CategoryHeader } from "./CategoryHeader";
import { UrlRow } from "./UrlRow";
import type { UrlEntry } from "./types";

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
