import { getAllPosts, getPostBySlug } from "@duyet/libs/getPost";
import type { Metadata } from "next";

interface Params {
  year: string;
  month: string;
  slug: string[];
}

interface MarkdownProps {
  params: Promise<Params>;
}

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = getAllPosts(["slug"]);

  return posts.map(({ slug }) => {
    const slugArray = slug
      .replace(/\.md|\.html$/, "")
      .replace(/^\//, "")
      .split("/");

    return {
      year: slugArray[0],
      month: slugArray[1],
      slug: [`${slugArray[2]}.md`],
    };
  });
}

export default async function MarkdownPage({ params }: MarkdownProps) {
  const { year, month, slug } = await params;
  const slugStr = slug[0].replace(/\.md$/, "");
  const slugPath = `${year}/${month}/${slugStr}`;

  const post = getPostBySlug(slugPath, ["content"]);

  return (
    <pre
      style={{
        margin: 0,
        padding: 0,
        whiteSpace: "pre-wrap",
        wordWrap: "break-word",
        fontFamily: "monospace",
        fontSize: "14px",
      }}
    >
      {post.content}
    </pre>
  );
}

export async function generateMetadata({
  params,
}: MarkdownProps): Promise<Metadata> {
  const { year, month, slug } = await params;
  const slugStr = slug[0].replace(/\.md$/, "");
  const slugPath = `${year}/${month}/${slugStr}`;
  const post = getPostBySlug(slugPath, ["title"]);

  return {
    title: `${post.title} - Markdown`,
  };
}
