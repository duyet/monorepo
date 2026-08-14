import { ArrowUpRight } from "lucide-react";
import { blogPostHref, resolveBlogPosts } from "../data/blog-posts";

export function ProjectBlogLinks({
  slugs,
  limit,
  heading,
  className,
  headingClassName = "text-[11px] font-[var(--font-mono)] text-[var(--rd-text-3)] mb-1.5 uppercase tracking-wider",
  linkClassName,
  iconSize = 10,
}: {
  slugs?: string[];
  limit?: number;
  heading?: string;
  className?: string;
  headingClassName?: string;
  linkClassName?: string;
  iconSize?: number;
}) {
  const posts = resolveBlogPosts(slugs, limit);
  if (posts.length === 0) return null;

  return (
    <div className={className}>
      {heading ? <p className={headingClassName}>{heading}</p> : null}
      {posts.map((post) => (
        <a
          key={post.slug}
          href={blogPostHref(post.slug)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {post.title} <ArrowUpRight size={iconSize} className="inline" />
        </a>
      ))}
    </div>
  );
}
