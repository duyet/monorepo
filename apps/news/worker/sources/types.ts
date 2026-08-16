export interface FetchedItemSource {
  kind: "source" | "support" | "discussion";
  author?: string;
  postedAt?: number;
  quote?: string;
  url?: string;
}

export interface FetchedItem {
  externalId?: string;
  url: string;
  title: string;
  summary?: string;
  publishedAt: number;
  points?: number;
  comments?: number;
  sources?: FetchedItemSource[];
}

export interface SourceAdapter {
  type: string;
  fetchItems(
    config: Record<string, unknown>,
    sinceEpochSec: number
  ): Promise<FetchedItem[]>;
}
