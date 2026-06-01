import type { Post } from "@duyet/interfaces";
import type { TOCItem } from "@duyet/libs/extractHeadings";

export type LoadedPost = Post & {
  mdxSource?: string;
  headings?: TOCItem[];
  markdown_content?: string;
  edit_url?: string;
};
