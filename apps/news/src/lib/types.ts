export type Lang = "en" | "vi";

export interface FeedItem {
  id: string;
  url: string;
  title: string;
  title_vi: string | null;
  category: string | null;
  published_at: number;
  points: number;
  comments: number;
  rank_score: number;
  source_id: string;
  tags: string[];
}

export interface TldrBullet {
  text: string;
  item_id?: string;
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
}
