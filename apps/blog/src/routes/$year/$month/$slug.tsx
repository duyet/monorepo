import Header from "@duyet/components/Header";
import Container from "@duyet/components/Container";
import { getRelatedPosts } from "@duyet/libs/getRelatedPosts";
import { getPostBySlug } from "@duyet/libs/getPost";
import { extractHeadings } from "@duyet/libs/extractHeadings";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { use } from "react";
import { ReadingProgress } from "@/components/post/ReadingProgress";
import { RelatedPosts } from "@/components/post/RelatedPosts";
import { SeriesNav } from "@/components/post/SeriesNav";
import { TableOfContents } from "@/components/post/TableOfContents";
import { getSeriesNavigation } from "@/lib/getSeriesNav";
import Content from "./content";
import Meta from "./meta";

export const Route = createFileRoute("/$year/$month/$slug")({
  head: ({ params }) => {
    const { year, month, slug: rawSlug } = params;
    const slug = rawSlug.replace(/\.(md|html)$/, "");
    try {
      const post = getPostBySlug(`${year}/${month}/${slug}`, [
        "title",
        "excerpt",
        "date",
        "author",
        "category",
        "tags",
      ]);
      return {
        meta: [
          { title: `${post.title} | Tôi là Duyệt` },
          { name: "description", content: post.excerpt || "" },
          { name: "author", content: (post.author as string) || "Duyet Le" },
          { property: "og:title", content: post.title || "" },
          { property: "og:description", content: post.excerpt || "" },
          { property: "og:type", content: "article" },
          {
            property: "og:url",
            content: `https://blog.duyet.net/${year}/${month}/${slug}`,
          },
          { name: "twitter:card", content: "summary" },
          { name: "twitter:title", content: post.title || "" },
          { name: "twitter:description", content: post.excerpt || "" },
        ],
        links: [
          {
            rel: "alternate",
            type: "text/markdown",
            href: `https://blog.duyet.net/${year}/${month}/${slug}.md`,
          },
        ],
      };
    } catch {
      return {};
    }
  },
  beforeLoad: ({ params }) => {
    const { year, month, slug: rawSlug } = params;
    const slug = rawSlug.replace(/\.(md|html)$/, "");
    try {
      getPostBySlug(`${year}/${month}/${slug}`, ["slug"]);
    } catch {
      throw notFound();
    }
  },
  component: PostPage,
});

function PostPage() {
  const { year, month, slug: rawSlug } = Route.useParams();
  const slug = rawSlug.replace(/\.(md|html)$/, "");

  const post = use(loadPost(year, month, slug));
  const relatedPosts = getRelatedPosts(post, 4);
  const seriesNav = post.series
    ? getSeriesNavigation(`${year}/${month}/${slug}`, post.series as string)
    : { prev: null, next: null };

  return (
    <>
      <Header />
      <Container>
        <div className="relative">
          <ReadingProgress />
          <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
            <article>
              <Content post={post} />
              <SeriesNav prev={seriesNav.prev} next={seriesNav.next} />
              <Meta className="mt-10" post={post} />
              <RelatedPosts posts={relatedPosts} />
            </article>
          </div>

          <TableOfContents headings={post.headings || []} />
        </div>
      </Container>
    </>
  );
}

// Cache post loading to avoid duplicate work
const postCache = new Map<string, Promise<ReturnType<typeof fetchPost>>>();

async function loadPost(year: string, month: string, slug: string) {
  const key = `${year}/${month}/${slug}`;
  if (!postCache.has(key)) {
    postCache.set(key, fetchPost(year, month, slug));
  }
  return postCache.get(key)!;
}

async function fetchPost(year: string, month: string, slug: string) {
  const post = getPostBySlug(`${year}/${month}/${slug}`, [
    "slug",
    "title",
    "excerpt",
    "date",
    "content",
    "category",
    "category_slug",
    "tags",
    "series",
    "snippet",
    "isMDX",
    "readingTime",
    "author",
  ]);

  const markdownContent = post.content || "Error";
  const headings = await extractHeadings(markdownContent);

  const repoUrl =
    import.meta.env.VITE_GITHUB_REPO_URL ||
    "https://github.com/duyet/monorepo";
  const file = `${year}/${month}/${slug}.md`;
  const edit_url = `${repoUrl}/edit/master/apps/blog/_posts/${file}`;

  if (post.isMDX) {
    return {
      ...post,
      content: "",
      mdxSource: markdownContent,
      isMDX: true,
      headings,
      markdown_content: markdownContent,
      edit_url,
    };
  }

  const content = await markdownToHtml(markdownContent);

  return {
    ...post,
    content,
    headings,
    markdown_content: markdownContent,
    edit_url,
  };
}
