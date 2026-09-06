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
    <div className="home-blog-layout">
      <a
        className="home-blog-feature"
        href={`https://blog.duyet.net${featuredPost.slug}`}
        target="_blank"
        rel="noreferrer"
      >
        {thumb ? (
          <div className="home-blog-feature-media">
            <img src={thumb} alt="" loading="lazy" />
          </div>
        ) : null}
        <div className="home-blog-feature-copy">
          <div className="home-blog-feature-meta">
            <SoftLabel tone={toneFrom(featuredPost.category)}>
              {featuredPost.category}
            </SoftLabel>
            <span className="home-inbox-time">{metaLine(featuredPost)}</span>
          </div>
          <h3 className="home-blog-feature-title">{featuredPost.title}</h3>
          {featuredPost.excerpt ? (
            <p className="home-blog-feature-excerpt">{featuredPost.excerpt}</p>
          ) : null}
          <span className="home-text-link mt-auto inline-flex pt-4">
            Read post →
          </span>
        </div>
      </a>

      <div className="home-blog-side">
        {more.length > 0 ? (
          <div className="home-blog-more">
            {more.map((post) => {
              const tags = post.tags?.slice(0, 2) ?? [];
              return (
                <a
                  key={post.slug}
                  className="home-blog-post"
                  href={`https://blog.duyet.net${post.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <div className="home-blog-post-meta">
                    <SoftLabel tone={toneFrom(post.category)}>
                      {post.category}
                    </SoftLabel>
                    <span className="home-inbox-time">{metaLine(post)}</span>
                  </div>
                  <h4 className="home-blog-post-title">{post.title}</h4>
                  {post.excerpt ? (
                    <p className="home-blog-post-excerpt">{post.excerpt}</p>
                  ) : null}
                  {tags.length > 0 ? (
                    <p className="home-blog-post-tags">{tags.join(" · ")}</p>
                  ) : null}
                </a>
              );
            })}
          </div>
        ) : null}

        {notes && notes.length > 0 ? (
          <div className="home-notes">
            <div className="home-notes-head">
              <span>Quick notes</span>
              <a
                href="https://blog.duyet.net/notes/"
                target="_blank"
                rel="noreferrer"
                className="home-text-link"
              >
                All notes →
              </a>
            </div>
            <ul className="home-notes-list">
              {notes.slice(0, 3).map((note) => (
                <li key={`${note.id}-${note.date}`}>
                  <a
                    href={`https://blog.duyet.net/note/${note.id}/`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <span className="truncate">{note.title}</span>
                    <span className="home-inbox-time shrink-0">
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
