import { YearPost } from "@/components/post";
import { HeroBanner } from "@/components/layout";
import { getTagColorClass, getTagMetadata } from "@/lib/tag-metadata";
import Container from "@duyet/components/Container";
import type { Post } from "@duyet/interfaces";
import { getAllTags, getPostsByTag } from "@duyet/libs/getPost";
import { getSlug } from "@duyet/libs/getSlug";

export const dynamic = "force-static";
export const dynamicParams = false;

interface Params {
  tag: string;
}

interface PostsByTagProps {
  params: Promise<Params>;
}

export async function generateStaticParams() {
  const tags = getAllTags();

  return Object.keys(tags).map((tag: string) => ({
    tag: getSlug(tag),
  }));
}

export default async function PostsByTag({ params }: PostsByTagProps) {
  const { tag } = await params;
  const posts = await getPosts(tag);

  // Get the tag display name (reverse slug to title)
  const tags = getAllTags();
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
    <div className="min-h-screen">
      <Container>
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
        <div className="flex flex-col gap-12">
          {Object.entries(postsByYear)
            .sort(([a], [b]) => Number.parseInt(b) - Number.parseInt(a))
            .map(([year, yearPosts]) => (
              <YearPost
                key={year}
                year={Number.parseInt(year)}
                posts={yearPosts}
              />
            ))}
        </div>

        {/* Empty state */}
        {posts.length === 0 && (
          <div className="py-12 text-center">
            <p className="text-lg text-neutral-600">
              No posts found with this tag yet.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}

async function getPosts(tag: Params["tag"]) {
  return getPostsByTag(tag, ["slug", "date", "title", "category", "featured"]);
}
