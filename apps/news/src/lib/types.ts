export type Lang = "en" | "vi";

export interface ItemSource {
  kind: string; // source | support | discussion
  author: string | null;
  posted_at: number | null;
  quote: string | null;
  url: string | null;
}

export interface FeedItem {
  id: string;
  url: string;
  title: string;
  title_vi: string | null;
  summary: string | null;
  summary_vi: string | null;
  category: string | null;
  published_at: number;
  points: number;
  comments: number;
  rank_score: number;
  source_id: string;
  tags: string[];
  sources: ItemSource[];
  llm_tokens: number;
  image_url: string | null;
}

export interface TldrBullet {
  text: string;
  item_ids?: string[];
}

export interface DayGroup {
  date: string; // YYYY-MM-DD
  items: FeedItem[];
  categoryCounts: Record<string, number>;
}

export interface FeedResponse {
  tldr: {
    date: string;
    bullets_en: TldrBullet[];
    bullets_vi: TldrBullet[];
  } | null;
  days: DayGroup[];
  categories: { name: string; count: number }[];
  trending: { tag: string; count: number }[];
  totalStories: number;
  updatedAt: number;
  /** Epoch seconds of the newest fetched item (last successful ingest). */
  lastFetchedAt: number | null;
}
