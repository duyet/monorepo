import { YearPost } from "@/components/post";
import { HeroBanner } from "@/components/layout";
import {
  getCategoryColorClass,
  getCategoryMetadata,
} from "@/lib/category-metadata";
import Container from "@duyet/components/Container";
import type { Post } from "@duyet/interfaces";
import { getAllCategories, getPostsByCategory } from "@duyet/libs/getPost";
import { getSlug } from "@duyet/libs/getSlug";

export const dynamic = "force-static";
export const dynamicParams = false;

interface Params {
  category: string;
}

interface PostsByCategoryProps {
  params: Promise<Params>;
}

export async function generateStaticParams() {
  const categories = getAllCategories();

  return Object.keys(categories).map((cat: string) => ({
    category: getSlug(cat),
  }));
}

export default async function PostsByCategory({
  params,
}: PostsByCategoryProps) {
  const { category } = await params;
  const posts = await getPosts(category);

  // Get the category display name (reverse slug to title)
  const categories = getAllCategories();
  const categoryName =
    Object.keys(categories).find((cat) => getSlug(cat) === category) ||
    category;

  // Get the index for consistent color rotation
  const categoryIndex = Object.keys(categories)
    .sort((a, b) => categories[b] - categories[a])
    .indexOf(categoryName);

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
  const metadata = getCategoryMetadata(categoryName, postCount, categoryIndex);
  const colorClass = getCategoryColorClass(metadata.color, "light");

  return (
    <div className="min-h-screen">
      <Container>
        <HeroBanner
          title={categoryName}
          description={metadata.description}
          colorClass={colorClass}
          postCount={postCount}
          yearCount={yearCount}
          backLinkHref="/category"
          backLinkText="All Categories"
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
              No posts found in this category yet.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}

async function getPosts(category: Params["category"]) {
  return getPostsByCategory(category, [
    "slug",
    "date",
    "title",
    "category",
    "featured",
  ]);
}
