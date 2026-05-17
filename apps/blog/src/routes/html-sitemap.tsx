import type { Post } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute } from "@tanstack/react-router";
import { getAllCategories, getAllPosts } from "@/lib/posts";

export const Route = createFileRoute("/html-sitemap")({
  head: () => ({
    meta: [{ title: "HTML Sitemap | Tôi là Duyệt" }],
  }),
  loader: async () => {
    const [posts, categoriesMap] = await Promise.all([
      getAllPosts(),
      getAllCategories(),
    ]);
    return { posts, categories: Object.keys(categoriesMap) };
  },
  component: HtmlSitemapPage,
});

function HtmlSitemapPage() {
  const { posts, categories } = Route.useLoaderData() as {
    posts: Post[];
    categories: string[];
  };
  const HOME_URL = import.meta.env.VITE_DUYET_HOME_URL || "https://duyet.net";
  const linkClass =
    "text-[var(--ink)] underline underline-offset-4 transition-colors hover:text-[var(--body)] dark:text-[var(--on-dark)] dark:hover:text-[var(--on-dark-soft)]";

  return (
    <div className="mx-auto max-w-[820px] px-5 sm:px-8 lg:px-10">
      <div className="blog-page-head border-b border-[var(--border-faint)] pb-8">
        <h1 className="text-4xl font-semibold tracking-tight text-[#1a1a1a] dark:text-[#f8f8f2] sm:text-5xl">
          HTML Sitemap
        </h1>
      </div>

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a1a] dark:text-[#f8f8f2]">
            Blog Posts ({posts.length})
          </h2>
          <ul className="space-y-2">
            {posts.map((post: Post) => (
              <li key={post.slug}>
                <a
                  href={post.slug}
                  className={linkClass}
                >
                  {post.title}
                </a>
                <div className="text-sm text-[#1a1a1a]/55 dark:text-[#f8f8f2]/55">
                  {new Date(post.date).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-xl font-semibold text-[#1a1a1a] dark:text-[#f8f8f2]">
            Categories ({categories.length})
          </h2>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category}>
                <a
                  href={`/category/${getSlug(category)}/`}
                  className={linkClass}
                >
                  {category}
                </a>
              </li>
            ))}
          </ul>

          <h2 className="mb-4 mt-8 text-xl font-semibold text-[#1a1a1a] dark:text-[#f8f8f2]">
            Pages
          </h2>
          <ul className="space-y-2">
            <li>
              <a
                href="/"
                className={linkClass}
              >
                Home
              </a>
            </li>
            <li>
              <a
                href={`${HOME_URL}/about`}
                className={linkClass}
                target="_blank"
                rel="noopener noreferrer"
              >
                About
              </a>
            </li>
            <li>
              <a
                href="/archives/"
                className={linkClass}
              >
                Archives
              </a>
            </li>
            <li>
              <a
                href="/featured/"
                className={linkClass}
              >
                Featured
              </a>
            </li>
            <li>
              <a
                href="/tags/"
                className={linkClass}
              >
                Tags
              </a>
            </li>
            <li>
              <a
                href="/series/"
                className={linkClass}
              >
                Series
              </a>
            </li>
          </ul>
        </section>
      </div>

      <div className="mt-8 border-t border-[#1a1a1a]/10 pt-4 text-sm text-[#1a1a1a]/55 dark:border-[#f8f8f2]/10 dark:text-[#f8f8f2]/55">
        <p>
          This sitemap is also available in XML format at{" "}
          <a
            href="/sitemap.xml"
            className={linkClass}
          >
            /sitemap.xml
          </a>
        </p>
      </div>
    </div>
  );
}
