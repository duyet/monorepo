import { formatReadingTime } from "@duyet/libs/date";
import { MarkdownMenuWrapper } from "./-markdown-menu-wrapper";
import type { LoadedPost } from "./-types";

export function PostHero({ post }: { post: LoadedPost }) {
  const date = new Date(post.date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  const readingTime = post.readingTime
    ? formatReadingTime(post.readingTime)
    : null;

  return (
    <header className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 pt-12 md:pt-16 pb-6 text-center">

      <h1
        className="rd-display text-center text-[clamp(2.4rem,6vw,4rem)] leading-[1.04] tracking-[-0.04em] font-semibold text-balance mb-10"
      >
        {post.title}
      </h1>


      <div className="flex items-center justify-center gap-5 flex-wrap mb-6">
        <span className="rd-chip font-[var(--font-mono)] text-[10.5px]">
          {post.category}
        </span>
        <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[12.5px]">
          {date}
        </span>
        {readingTime && (
          <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[12.5px]">
            {readingTime}
          </span>
        )}
        {post.changelog && post.changelog.length > 0 && (
          <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[12.5px]">
            {post.changelog.length} updates · updated {post.changelog[0].date}
          </span>
        )}
        {post.markdown_content && (
          <MarkdownMenuWrapper
            markdownUrl={`${post.slug.replace(/\.html$/, "")}.md`}
            markdownContent={post.markdown_content}
            dropUp={false}
          />
        )}
      </div>

      {/* Hero image */}
      {post.thumbnail && (
        <img
          src={post.thumbnail}
          alt={post.title}
          loading="eager"
          className="block w-full my-[30px] rounded-[var(--rd-r)]"
        />
      )}
    </header>
  );
}
