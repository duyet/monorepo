import { getAllPosts, getPostBySlug } from "@duyet/libs/getPost";
import { NextResponse } from "next/server";

interface Params {
  year: string;
  month: string;
  slug: string[];
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

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> }
) {
  const { year, month, slug } = await params;
  const slugStr = slug[0].replace(/\.md$/, "");
  const slugPath = `${year}/${month}/${slugStr}`;

  const post = getPostBySlug(slugPath, [
    "content",
    "title",
    "date",
    "tags",
    "category",
  ]);

  const date = new Date(post.date).toISOString().split("T")[0];
  const url = `https://blog.duyet.net/${slugPath}/`;
  const tags = post.tags?.join(", ") || "";

  const markdown = `---
title: "${post.title}"
date: ${date}
category: ${post.category}
tags: ${tags}
url: ${url}
---

${post.content}`;

  return new NextResponse(markdown, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
    },
  });
}
