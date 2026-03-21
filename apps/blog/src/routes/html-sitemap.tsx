import type { CategoryCount, Post } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute } from "@tanstack/react-router";
import { getAllCategories, getAllPosts } from "@/lib/posts";

export const Route = createFileRoute("/html-sitemap")({
  head: () => ({
    meta: [
      { title: "HTML Sitemap | Tôi là Duyệt" },
    ],
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
  const HOME_URL =
    import.meta.env.VITE_DUYET_HOME_URL || "https://duyet.net";

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold">HTML Sitemap</h1>

      <div className="grid gap-8 md:grid-cols-2">
        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Blog Posts ({posts.length})
          </h2>
          <ul className="space-y-2">
            {posts.map((post: Post) => (
              <li key={post.slug}>
                <a
                  href={post.slug}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {post.title}
                </a>
                <div className="text-sm text-gray-500">
                  {new Date(post.date).toLocaleDateString()}
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="mb-4 text-2xl font-semibold">
            Categories ({categories.length})
          </h2>
          <ul className="space-y-2">
            {categories.map((category) => (
              <li key={category}>
                <a
                  href={`/category/${getSlug(category)}`}
                  className="text-blue-600 underline hover:text-blue-800"
                >
                  {category}
                </a>
              </li>
            ))}
          </ul>

          <h2 className="mb-4 mt-8 text-2xl font-semibold">Pages</h2>
          <ul className="space-y-2">
            <li>
              <a href="/" className="text-blue-600 underline hover:text-blue-800">
                Home
              </a>
            </li>
            <li>
              <a
                href={`${HOME_URL}/about`}
                className="text-blue-600 underline hover:text-blue-800"
                target="_blank"
                rel="noopener noreferrer"
              >
                About
              </a>
            </li>
            <li>
              <a href="/archives" className="text-blue-600 underline hover:text-blue-800">
                Archives
              </a>
            </li>
            <li>
              <a href="/featured" className="text-blue-600 underline hover:text-blue-800">
                Featured
              </a>
            </li>
            <li>
              <a href="/tags" className="text-blue-600 underline hover:text-blue-800">
                Tags
              </a>
            </li>
            <li>
              <a href="/series" className="text-blue-600 underline hover:text-blue-800">
                Series
              </a>
            </li>
          </ul>
        </section>
      </div>

      <div className="mt-8 border-t pt-4 text-sm text-gray-500">
        <p>
          This sitemap is also available in XML format at{" "}
          <a href="/sitemap.xml" className="underline">
            /sitemap.xml
          </a>
        </p>
      </div>
    </div>
  );
}
