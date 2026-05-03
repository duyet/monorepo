import Container from "@duyet/components/Container";
import type { Post, TagCount } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout";
import { YearPost } from "@/components/post";
import { getTagColorClass, getTagMetadata } from "@/lib/tag-metadata";
import { getAllTags, getPostsByTag } from "@/lib/posts";

export const Route = createFileRoute("/tag/$tag")({
  head: ({ params }) => {
    const { tag } = params;
    return {
      meta: [
        { title: `${tag} | Tôi là Duyệt` },
        { name: "description", content: `Blog posts tagged with ${tag}.` },
      ],
    };
  },
  loader: async ({ params }) => {
    const [posts, tags] = await Promise.all([
      getPostsByTag(params.tag),
      getAllTags(),
    ]);
    const found = Object.keys(tags).some((t) => getSlug(t) === params.tag);
    if (!found) throw notFound();
    return { posts, tags };
  },
  component: PostsByTag,
});

function PostsByTag() {
  const { tag } = Route.useParams();
  const { posts, tags } = Route.useLoaderData() as {
    posts: Post[];
    tags: TagCount;
  };

  // Get the tag display name (reverse slug to title)
  const tagName = Object.keys(tags).find((t) => getSlug(t) === tag) || tag;

  // Get the index for consistent color rotation
  const tagIndex = Object.keys(tags)
    .sort((a, b) => tags[b] - tags[a])
    .indexOf(tagName);

  // Group posts by year
  const postsByYear = posts.reduce((acc: Record<number, Post[]>, post) => {
    const year = new Date(post.date).getFullYear();
    if (!acc[year]) {
      acc[year] = [];
    }
    acc[year].push(post);
    return acc;
  }, {});

  const postCount = posts.length;
  const yearCount = Object.keys(postsByYear).length;

  // Get dynamic metadata
  const metadata = getTagMetadata(tagName, postCount, tagIndex);
  const colorClass = getTagColorClass(metadata.color, "light");

  return (
    <div className="min-h-screen bg-[#f8f8f2] pb-14 dark:bg-[#0d0e0c]">
      <Container className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <HeroBanner
          title={tagName}
          description={metadata.description}
          colorClass={colorClass}
          postCount={postCount}
          yearCount={yearCount}
          backLinkHref="/tags"
          backLinkText="All Topics"
        />

        {/* Posts organized by year */}
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {Object.entries(postsByYear)
            .sort(([a], [b]) => Number.parseInt(b, 10) - Number.parseInt(a, 10))
            .map(([year, yearPosts]) => (
              <YearPost
                key={year}
                year={Number.parseInt(year, 10)}
                posts={yearPosts}
              />
            ))}
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-[#1a1a1a]/70 dark:text-[#f8f8f2]/70">
              No posts found with this tag yet.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
