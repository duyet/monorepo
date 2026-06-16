export type ChangelogEntry = {
  date: string;
  note: string;
};

export type Post = {
  slug: string;
  title: string;
  date: Date;
  category: string;
  category_slug: string;
  tags: string[];
  tags_slug: string[];
  featured: boolean;
  thumbnail?: string;
  author?: string;
  content?: string;
  excerpt?: string;
  edit_url?: string;
  series?: string;
  snippet?: string;
  path?: string;
  isMDX?: boolean;
  mdxCode?: string;
  readingTime?: number;
  tokenCount?: number;
  changelog?: ChangelogEntry[];
  /**
   * Set on a child post: the slug of its parent overview post
   * (e.g. "/2026/01/coding-agent").
   */
  parent?: string;
  /**
   * Set on a parent post: the ordered last-segment slugs of its child posts
   * (e.g. ["claude-code", "plan-mode", ...]).
   */
  parts?: string[];
};

export interface TagCount {
  [key: string]: number;
}

export interface CategoryCount {
  [key: string]: number;
}

export interface Series {
  name: string;
  slug: string;
  posts: Post[];
}
