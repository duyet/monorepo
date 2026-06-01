import type { Post } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute } from "@tanstack/react-router";
import type { ReactElement } from "react";
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

const linkClass =
  "text-[color:var(--em-foreground)] underline decoration-[color:var(--em-hairline)] decoration-1 underline-offset-4 transition-colors hover:decoration-[color:var(--em-accent)]";

function HtmlSitemapPage(): ReactElement {
  const { posts, categories } = Route.useLoaderData() as {
    posts: Post[];
    categories: string[];
  };
  const HOME_URL = import.meta.env.VITE_DUYET_HOME_URL || "https://duyet.net";

  return (
    <div className="px-6 md:px-8">
      <header className="pt-24 md:pt-28 pb-10 mx-auto">
        <span className="inline-block text-[0.6875rem] font-medium tracking-[0.16em] uppercase text-muted-foreground mb-3.5">
          Index
        </span>
        <h1 className="text-[clamp(2.25rem,4.5vw,3.25rem)] font-semibold leading-[1.08] tracking-[-0.018em] text-foreground m-0">
          HTML sitemap
        </h1>
      </header>

      <div className="mx-auto grid max-w-2xl gap-12 md:max-w-4xl md:grid-cols-2">
        <section aria-label="Blog posts">
          <h2 className="font-editorial-serif mb-4 text-xl font-medium text-[color:var(--em-foreground)]">
            Posts{" "}
            <span className="text-[color:var(--em-subtle)] text-base tabular-nums">
              {posts.length}
            </span>
          </h2>
          <ul className="space-y-2 text-[15px] leading-relaxed">
            {posts.map((post) => (
              <li
                key={post.slug}
                className="flex flex-wrap items-baseline gap-3"
              >
                <a href={post.slug} className={linkClass}>
                  {post.title}
                </a>
                <span className="text-xs tabular-nums text-[color:var(--em-subtle)]">
                  {new Date(post.date).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Sections">
          <h2 className="font-editorial-serif mb-4 text-xl font-medium text-[color:var(--em-foreground)]">
            Categories{" "}
            <span className="text-[color:var(--em-subtle)] text-base tabular-nums">
              {categories.length}
            </span>
          </h2>
          <ul className="space-y-2 text-[15px] leading-relaxed">
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

          <h2 className="font-editorial-serif mb-4 mt-10 text-xl font-medium text-[color:var(--em-foreground)]">
            Pages
          </h2>
          <ul className="space-y-2 text-[15px] leading-relaxed">
            <li>
              <a href="/" className={linkClass}>
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
              <a href="/archives/" className={linkClass}>
                Archives
              </a>
            </li>
            <li>
              <a href="/featured/" className={linkClass}>
                Featured
              </a>
            </li>
            <li>
              <a href="/tags/" className={linkClass}>
                Tags
              </a>
            </li>
            <li>
              <a href="/series/" className={linkClass}>
                Series
              </a>
            </li>
          </ul>

          <p className="mt-10 text-xs text-[color:var(--em-muted)]">
            XML sitemap:{" "}
            <a href="/sitemap.xml" className={linkClass}>
              /sitemap.xml
            </a>
          </p>
        </section>
      </div>
    </div>
  );
}
