export interface FetchedItem {
  externalId?: string;
  url: string;
  title: string;
  summary?: string;
  publishedAt: number;
  points?: number;
  comments?: number;
}

export interface SourceAdapter {
  type: string;
  fetchItems(
    config: Record<string, unknown>,
    sinceEpochSec: number
  ): Promise<FetchedItem[]>;
}
