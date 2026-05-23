import type { CategoryCount, Post } from "@duyet/interfaces";
import { dateFormat } from "@duyet/libs/date";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import type { CSSProperties, ReactElement } from "react";
import { getCategoryMetadata } from "@/lib/category-metadata";
import { getAllCategories, getPostsByCategory } from "@/lib/posts";

export const Route = createFileRoute("/category/$category")({
  head: ({ params }) => {
    const { category } = params;
    return {
      meta: [
        { title: `${category} | Tôi là Duyệt` },
        {
          name: "description",
          content: `Blog posts in the ${category} category.`,
        },
      ],
    };
  },
  loader: async ({ params }) => {
    const [posts, categories] = await Promise.all([
      getPostsByCategory(params.category),
      getAllCategories(),
    ]);
    const found = Object.keys(categories).some(
      (cat) => getSlug(cat) === params.category
    );
    if (!found) throw notFound();
    return { posts, categories };
  },
  component: PostsByCategory,
});

function postParams(post: Post) {
  const [, year, month, slug] = post.slug.split("/");
  return { year, month, slug };
}

function PostsByCategory(): ReactElement {
  const { category } = Route.useParams();
  const { posts, categories } = Route.useLoaderData() as {
    posts: Post[];
    categories: CategoryCount;
  };

  const categoryName =
    Object.keys(categories).find((cat) => getSlug(cat) === category) ||
    category;

  const categoryIndex = Object.keys(categories)
    .sort((a, b) => categories[b] - categories[a])
    .indexOf(categoryName);

  const postsByYear = posts.reduce((acc: Record<number, Post[]>, post) => {
    const year = new Date(post.date).getFullYear();
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {});

  const metadata = getCategoryMetadata(
    categoryName,
    posts.length,
    categoryIndex
  );

  return (
    <div className="px-6 md:px-8">
      <header className="em-masthead">
        <span className="em-masthead__eyebrow">
          <Link
            to="/category/"
            className="transition-colors hover:text-[color:var(--em-foreground)]"
          >
            Category
          </Link>
        </span>
        <h1 className="em-masthead__title">{categoryName}</h1>
        {metadata.description && (
          <p className="em-masthead__dek">{metadata.description}</p>
        )}
        <div className="em-masthead__meta">
          <span>
            {posts.length} {posts.length === 1 ? "post" : "posts"}
          </span>
          <span>
            {Object.keys(postsByYear).length}{" "}
            {Object.keys(postsByYear).length === 1 ? "year" : "years"}
          </span>
        </div>
      </header>

      {Object.entries(postsByYear)
        .sort(([a], [b]) => Number.parseInt(b, 10) - Number.parseInt(a, 10))
        .map(([year, yearPosts]) => (
          <div key={year}>
            <h2 className="em-year">{year}</h2>
            <section className="em-list" aria-label={`Posts from ${year}`}>
              {yearPosts.map((post, i) => {
                const style: CSSProperties = {
                  animationDelay: `${Math.min(i, 8) * 40}ms`,
                };
                return (
                  <Link
                    key={post.slug}
                    to="/$year/$month/$slug/"
                    params={postParams(post)}
                    className="em-list__row editorial-enter"
                    style={style}
                  >
                    <h3 className="em-list__title">{post.title}</h3>
                    <div className="em-list__meta">
                      <time dateTime={new Date(post.date).toISOString()}>
                        {dateFormat(post.date, "MMM d, yyyy")}
                      </time>
                    </div>
                  </Link>
                );
              })}
            </section>
          </div>
        ))}

      {posts.length === 0 && (
        <p className="mx-auto mt-12 max-w-2xl text-center text-sm text-[color:var(--em-muted)]">
          No posts found in this category yet.
        </p>
      )}
    </div>
  );
}
