import { getAllPosts } from "@duyet/libs/getPost";
import type { Metadata } from "next";
import Content, { getPost } from "./content";
import Meta from "./meta";
import { TableOfContents } from "@/components/post/TableOfContents";

interface Params {
  year: string;
  month: string;
  slug: string;
}

interface PostProps {
  params: Promise<Params>;
}

export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = getAllPosts(["slug"]);
  const params: Array<{ year: string; month: string; slug: string }> = [];

  for (const { slug } of posts) {
    const slugArray = slug
      .replace(/\.md|\.html$/, "")
      .replace(/^\//, "")
      .split("/");

    // Clean slug for the main page
    params.push({
      year: slugArray[0],
      month: slugArray[1],
      slug: slugArray[2],
    });

    // .html variant - serves same HTML page
    params.push({
      year: slugArray[0],
      month: slugArray[1],
      slug: `${slugArray[2]}.html`,
    });
  }

  return params;
}

export default async function Post({ params }: PostProps) {
  const { year, month, slug: rawSlug } = await params;
  const slug = rawSlug.replace(/\.(md|html)$/, "");
  const post = await getPost([year, month, slug]);

  return (
    <div className="relative">
      {/* Main content - centered, original width */}
      <div className="container max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
        <article>
          <Content post={post} />
          <Meta className="mt-10" post={post} />
        </article>
      </div>

      {/* Table of Contents - fixed right side, outside content */}
      <TableOfContents />
    </div>
  );
}

export async function generateMetadata({
  params,
}: PostProps): Promise<Metadata> {
  const { year, month, slug: rawSlug } = await params;
  const slug = rawSlug.replace(/\.(md|html)$/, "");
  const post = await getPost([year, month, slug]);

  return {
    title: post.title,
    description: post.excerpt,
    creator: post.author,
    category: post.category,
    keywords: post.tags,
  };
}
