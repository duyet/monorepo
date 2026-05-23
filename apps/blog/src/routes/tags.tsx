import type { TagCount } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute, Link } from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
import { getAllTags } from "@/lib/posts";

export const Route = createFileRoute("/tags")({
  head: () => ({
    meta: [
      { title: "Topics | Tôi là Duyệt" },
      { name: "description", content: "Browse posts by topics and tags." },
    ],
  }),
  loader: async () => {
    const tags = await getAllTags();
    return { tags };
  },
  component: Tags,
});

function Tags(): ReactElement {
  const { tags } = Route.useLoaderData() as { tags: TagCount };
  const entries = Object.entries(tags).sort(([, a], [, b]) => b - a);
  const totalPosts = entries.reduce((sum, [, c]) => sum + c, 0);

  return (
    <div className="px-6 md:px-8">
      <header className="em-masthead">
        <span className="em-masthead__eyebrow">Index</span>
        <h1 className="em-masthead__title">Topics</h1>
        <p className="em-masthead__dek">
          {entries.length} tags across {totalPosts} posts.
        </p>
      </header>

      <div className="em-index">
        {entries.map(([tag, count], i) => {
          const style: CSSProperties = {
            animationDelay: `${Math.min(i, 20) * 20}ms`,
          };
          return (
            <Link
              key={tag}
              to="/tag/$tag/"
              params={{ tag: getSlug(tag) }}
              className="em-index__row editorial-enter"
              style={style}
            >
              <span className="em-index__name">{tag}</span>
              <span className="em-index__count">
                {count} {count === 1 ? "post" : "posts"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
