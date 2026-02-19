import type { Post } from "@duyet/interfaces";
import { getAllPosts } from "@duyet/libs/getPost";
import { NextResponse } from "next/server";

export const dynamic = "force-static";

export async function GET() {
  const posts = getAllPosts(
    ["slug", "title", "date", "category", "tags", "content"],
    100000
  );

  const llmsFullContent = `# Duyet Le - Technical Blog (Full Content)

> This file contains the full markdown content of all ${posts.length} blog posts.
> For a summary index, see https://blog.duyet.net/llms.txt

---

${posts
  .map((post: Post) => {
    const url = `https://blog.duyet.net${post.slug}`;
    const date = new Date(post.date).toISOString().split("T")[0];
    const tags = post.tags?.join(", ") || "";

    return `# ${post.title}

- **URL**: ${url}
- **Date**: ${date}
- **Category**: ${post.category}
- **Tags**: ${tags}

${post.content || ""}

---`;
  })
  .join("\n\n")}
`;

  return new NextResponse(llmsFullContent, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "Content-Signal": "ai-train=yes, search=yes, ai-input=yes",
    },
  });
}
