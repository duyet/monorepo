import { tw } from "../lib/tw";
import { SoftLabel, toneFrom } from "./SoftLabel";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  category: string;
  tags: string[];
  excerpt: string;
  readingTime?: number;
  thumbnail?: string;
}

interface Note {
  id: string;
  title: string;
  date: string;
  excerpt: string;
}

interface BlogTeaserProps {
  featuredPost: BlogPost;
  recentPosts: BlogPost[];
  notes?: Note[];
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function mediaUrl(path?: string): string | undefined {
  if (!path) return undefined;
  if (path.startsWith("http")) return path;
  return `https://blog.duyet.net${path}`;
}

function metaLine(post: BlogPost): string {
  const parts = [formatTime(post.date)];
  if (post.readingTime) parts.push(`${post.readingTime} min`);
  return parts.join(" · ");
}

export function BlogTeaser({
  featuredPost,
  recentPosts,
  notes,
}: BlogTeaserProps) {
  if (!featuredPost) return null;

  const thumb = mediaUrl(featuredPost.thumbnail);
  const more = recentPosts.slice(0, 4);

  return (
    <div className="grid gap-8 min-[900px]:grid-cols-[minmax(0,1.2fr)_minmax(0,0.9fr)]">
      <article className="overflow-hidden rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)]">
        {thumb ? (
          <div className="aspect-[16/9] overflow-hidden bg-[var(--rd-bg-sub)]">
            <img
              src={thumb}
              alt=""
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        ) : null}
        <div className="flex flex-col gap-2 p-[1.15rem]">
          <div className="flex flex-wrap items-center gap-2">
            <SoftLabel tone={toneFrom(featuredPost.category)}>
              {featuredPost.category}
            </SoftLabel>
            <span className={tw.time}>{metaLine(featuredPost)}</span>
          </div>
          <h3 className="m-0 font-[family-name:var(--font-display)] text-[clamp(1.25rem,2vw,1.55rem)] font-normal tracking-[-0.03em] leading-[1.2]">
            <a
              href={`https://blog.duyet.net${featuredPost.slug}`}
              target="_blank"
              rel="noreferrer"
              className="text-inherit no-underline hover:text-[var(--rd-accent-ink)]"
            >
              {featuredPost.title}
            </a>
          </h3>
          {featuredPost.excerpt ? (
            <p className="m-0 line-clamp-3 text-[0.9rem] leading-[1.55] text-[var(--rd-text-2)]">
              {featuredPost.excerpt}
            </p>
          ) : null}
        </div>
      </article>

      <div className="flex min-w-0 flex-col gap-4">
        {more.length > 0 ? (
          <div className="overflow-hidden rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)]">
            {more.map((post) => (
              <article
                key={post.slug}
                className="border-b border-[var(--rd-line)] px-[1.15rem] py-[0.95rem] last:border-b-0"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <SoftLabel tone={toneFrom(post.category)}>
                    {post.category}
                  </SoftLabel>
                  <span className={tw.time}>{metaLine(post)}</span>
                </div>
                <h4 className="m-0 mt-1.5 text-[0.95rem] font-medium tracking-[-0.02em] leading-[1.3]">
                  <a
                    href={`https://blog.duyet.net${post.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-inherit no-underline hover:text-[var(--rd-accent-ink)]"
                  >
                    {post.title}
                  </a>
                </h4>
                {post.excerpt ? (
                  <p className="m-0 mt-1 line-clamp-2 text-[0.8rem] leading-[1.45] text-[var(--rd-text-2)]">
                    {post.excerpt}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}

        {notes && notes.length > 0 ? (
          <div className="overflow-hidden rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)]">
            <div className="flex items-center justify-between border-b border-[var(--rd-line)] px-[1.15rem] py-2.5 text-[0.7rem] font-medium tracking-[0.08em] text-[var(--rd-text-3)] uppercase">
              <span>Quick notes</span>
              <a
                href="https://blog.duyet.net/notes/"
                target="_blank"
                rel="noreferrer"
                className={tw.link}
              >
                All notes →
              </a>
            </div>
            <ul className="m-0 list-none p-0">
              {notes.slice(0, 3).map((note) => (
                <li key={`${note.id}-${note.date}`}>
                  <a
                    href={`https://blog.duyet.net/note/${note.id}/`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center justify-between gap-3 border-b border-[var(--rd-line)] px-[1.15rem] py-2.5 text-inherit no-underline last:border-b-0 hover:bg-[var(--rd-surface-2)]"
                  >
                    <span className="truncate text-[0.875rem]">{note.title}</span>
                    <span className={`${tw.time} shrink-0`}>
                      {formatTime(note.date)}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
