import Container from "@duyet/components/Container";
import { getAllPosts } from "@duyet/libs/getPost";
import type { Metadata } from "next";
import path from "path";
import Content, { getPost } from "./content";
import Meta from "./meta";

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

  // Get MDX posts too
  const mdxPostsDir = path.join(process.cwd(), "_posts");
  let mdxPosts: string[] = [];

  try {
    const fs = require('fs');
    const getPostPaths = (dir: string): string[] => {
      const entries = fs.readdirSync(dir, { withFileTypes: true });
      const paths: string[] = [];
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          paths.push(...getPostPaths(fullPath));
        } else if (entry.isFile() && entry.name.endsWith('.mdx')) {
          paths.push(fullPath);
        }
      }
      return paths;
    };

    const mdxPaths = getPostPaths(mdxPostsDir);
    mdxPosts = mdxPaths.map(p => {
      const rel = path.relative(mdxPostsDir, p);
      return rel.replace(/\.mdx$/, '').replace(/\\/g, '/');
    });
  } catch (e) {
    // Ignore if no MDX posts
  }

  const allPosts = [...posts.map(p => p.slug), ...mdxPosts];

  return allPosts.flatMap((slug) => {
    const slugArray = slug
      .replace(/\.md|\.mdx|\.html$/, ".html")
      .replace(/^\//, "")
      .split("/");

    return {
      year: slugArray[0],
      month: slugArray[1],
      slug: slugArray[2],
    };
  });
}

export default async function Post({ params }: PostProps) {
  const { year, month, slug } = await params;
  const post = await getPost([year, month, slug]);

  return (
    <Container>
      <article>
        <Content post={post} />
        <Meta className="mt-10" post={post} />
      </article>
    </Container>
  );
}

export async function generateMetadata({
  params,
}: PostProps): Promise<Metadata> {
  const { year, month, slug } = await params;
  const post = await getPost([year, month, slug]);

  return {
    title: post.title,
    description: post.excerpt,
    creator: post.author,
    category: post.category,
    keywords: post.tags,
  };
}
