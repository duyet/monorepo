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
  isMdx?: boolean;
  markdown_content?: string;
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
