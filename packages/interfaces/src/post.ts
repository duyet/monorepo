export type Post = {
  slug: string;
  title: string;
  author?: string;
  date: Date;
  content: string;
  excerpt?: string;
  category: string;
  category_slug: string;
  tags: string[];
  tags_slug: string[];
  edit_url?: string;
  [key: string]: any;
};

export interface TagCount {
  [key: string]: number;
}

export interface CategoryCount {
  [key: string]: number;
}
