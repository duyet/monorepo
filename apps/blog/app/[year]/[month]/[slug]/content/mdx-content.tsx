import type { Post } from "@duyet/interfaces";
import { ReactNode } from "react";
import { MDXProvider } from "@mdx-js/react";
import { components } from "../../../mdx-components";

interface MdxContentProps {
  post: Post;
  children: ReactNode;
}

export function MdxContent({ post, children }: MdxContentProps) {
  return (
    <MDXProvider components={components}>
      <article className="prose prose-a[href^='https://']:after:content-['↗︎'] prose dark:prose-invert prose-code:break-words mb-10 mt-10 max-w-none">
        {children}
      </article>
    </MDXProvider>
  );
}