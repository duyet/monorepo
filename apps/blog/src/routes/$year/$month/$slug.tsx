import Container from "@duyet/components/Container";
import type { Post, Series } from "@duyet/interfaces";
import { extractHeadings } from "@duyet/libs/extractHeadings";
import type { TOCItem } from "@duyet/libs/extractHeadings";
import { markdownToHtml } from "@duyet/libs/markdownToHtml";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ReadingProgress } from "@/components/post/ReadingProgress";
import { TableOfContents } from "@/components/post/TableOfContents";
import {
  getPostBySlug,
  getSeries,
} from "@/lib/posts";
import Content from "./-content";
import Meta from "./-meta";

export const Route = createFileRoute("/$year/$month/$slug")({
  head: ({ params }) => {
    const { year, month, slug: rawSlug } = params;
    const slug = rawSlug.replace(/\.(md|html)$/, "");
    return {
      meta: [
        { title: `${slug.replace(/-/g, " ")} | Tôi là Duyệt` },
        { property: "og:type", content: "article" },
        {
          property: "og:url",
          content: `https://blog.duyet.net/${year}/${month}/${slug}`,
        },
      ],
      links: [
        {
          rel: "alternate",
          type: "text/markdown",
          href: `https://blog.duyet.net/${year}/${month}/${slug}.md`,
        },
      ],
    };
  },
  loader: async ({ params }) => {
    const { year, month, slug: rawSlug } = params;
    const slug = rawSlug.replace(/\.(md|html)$/, "");
    const slugPath = `${year}/${month}/${slug}`;

    let postWithContent;
    try {
      postWithContent = await getPostBySlug(slugPath);
    } catch {
      throw notFound();
    }

    const markdownContent = postWithContent.content || "";
    const headings = await extractHeadings(markdownContent);

    const repoUrl =
      import.meta.env.VITE_GITHUB_REPO_URL ||
      "https://github.com/duyet/monorepo";
    const file = `${year}/${month}/${slug}.md`;
    const edit_url = `${repoUrl}/edit/master/apps/blog/_posts/${file}`;

    let htmlContent = "";
    let mdxSource: string | undefined;

    if (postWithContent.isMDX) {
      mdxSource = markdownContent;
    } else {
      htmlContent = await markdownToHtml(markdownContent);
    }

    const series = postWithContent.series
      ? await getSeries({ name: postWithContent.series as string })
      : null;

    const post = {
      ...postWithContent,
      content: htmlContent,
      mdxSource,
      headings,
      markdown_content: markdownContent,
      edit_url,
    };

    return { post, series };
  },
  component: PostPage,
});

type LoadedPost = Post & {
  mdxSource?: string;
  headings?: TOCItem[];
  markdown_content?: string;
  edit_url?: string;
};

function PostPage() {
  const { post, series } = Route.useLoaderData() as {
    post: LoadedPost;
    series: Series | null;
  };

  return (
    <Container>
      <div className="relative">
        <ReadingProgress />
        <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <article>
            <Content post={post} />
            <Meta className="mt-10" post={post} series={series} />
          </article>
        </div>

        <TableOfContents headings={post.headings || []} />
      </div>
    </Container>
  );
}
