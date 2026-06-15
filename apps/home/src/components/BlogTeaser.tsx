import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Card } from "./ui/card";

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
  totalPosts: number;
  notes?: Note[];
}

export function BlogTeaser({ featuredPost, recentPosts, totalPosts, notes }: BlogTeaserProps) {
  if (!featuredPost) return null;

  const featuredCode = "npm i agents";
  // Thumbnails are root-relative blog paths; home is a different domain, so
  // resolve them against the blog origin.
  const rawThumb = featuredPost.thumbnail?.trim();
  const thumbUrl = rawThumb
    ? rawThumb.startsWith("http")
      ? rawThumb
      : `https://blog.duyet.net${rawThumb}`
    : null;

  return (
    <div
      className="grid grid-cols-[minmax(0,1.05fr)_minmax(0,.95fr)] items-stretch gap-[18px]"
    >
      {/* featured post card */}
      <div className="flex flex-col gap-[18px]">
        <a
          className="flex cursor-pointer flex-col overflow-hidden no-underline text-inherit border-0"
          href={`https://blog.duyet.net${featuredPost.slug}`}
          target="_blank"
          rel="noreferrer"
        >
          {thumbUrl ? (
            <div className="flex h-[180px] items-center overflow-hidden">
              <img
                src={thumbUrl}
                alt={featuredPost.title}
                loading="lazy"
                className="w-full h-auto max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="rd-termblock p-[26px_26px_30px]">
              <div className="flex gap-[7px]">
                <i />
                <i />
                <i />
              </div>
              <div
                className="font-[var(--font-mono)] mt-5 text-[22px] text-[var(--rd-accent)]"
              >
                <span className="opacity-60">$</span> {featuredCode}
                <span className="rd-caret" />
              </div>
            </div>
          )}
          <div className="p-0">
            <div
              className="flex items-center gap-[10px] mb-3"
            >
              <Badge variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">
                {featuredPost.category}
              </Badge>
              <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
                {formatBlogDate(featuredPost.date)} · {featuredPost.readingTime}{" "}
                min
              </span>
            </div>
            <h3
              className="text-[1.5rem] tracking-[-0.03em]"
            >
              {featuredPost.title}
            </h3>
            {featuredPost.excerpt && (
              <p
                className="text-[var(--rd-text-2)] mt-[10px] text-[14.5px]"
              >
                {featuredPost.excerpt}
              </p>
            )}
          </div>
        </a>

        {/* recent notes */}
        {notes && notes.length > 0 && (
          <Card className="p-0 border-0">
            <div className="flex items-center justify-between px-[22px] pt-[18px] pb-[6px]">
              <span className="font-[var(--font-mono)] text-[10.5px] uppercase tracking-[0.14em] text-[var(--rd-text-3)]">
                Quick notes
              </span>
              <Button variant="link" size="sm" asChild className="inline-flex mt-0 p-0 h-auto text-[12px]">
                <a
                  href="https://blog.duyet.net/notes/"
                  target="_blank"
                  rel="noreferrer"
                >
                  All notes &rarr;
                </a>
              </Button>
            </div>
            <div className="rd-rows">
              {notes.slice(0, 5).map((note) => (
                <a
                  key={`${note.id}-${note.date}`}
                  className="rd-row cursor-pointer grid-cols-[1fr_auto] p-[12px_8px] no-underline text-inherit"
                  href={`https://blog.duyet.net/note/${note.id}/`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="min-w-0">
                    <div className="overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-[540]">
                      {note.title}
                    </div>
                  </div>
                  <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[11px]">
                    {formatBlogDate(note.date)}
                  </span>
                </a>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* recent posts list */}
      <Card className="p-0 border-0">
        <div className="rd-rows border-t-0">
          {recentPosts.slice(0, 5).map((post) => (
            <a
              key={post.slug}
              className="rd-row cursor-pointer grid-cols-[1fr_auto] p-[15px_8px] no-underline text-inherit"
              href={`https://blog.duyet.net${post.slug}`}
              target="_blank"
              rel="noreferrer"
            >
              <div className="min-w-0">
                <div
                  className="overflow-hidden text-ellipsis whitespace-nowrap text-[15px] font-[550]"
                >
                  {post.title}
                </div>
                <div
                  className="font-[var(--font-mono)] text-[var(--rd-text-3)] mt-1 text-[11.5px]"
                >
                  {post.category} · {formatBlogDate(post.date)}
                </div>
                {post.excerpt && (
                  <div
                    className="text-[var(--rd-text-2)] mt-[5px] overflow-hidden text-ellipsis whitespace-nowrap text-[13px]"
                  >
                    {post.excerpt}
                  </div>
                )}
              </div>
              <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-xs">
                {post.readingTime} min
              </span>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}

function formatBlogDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
