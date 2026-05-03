import Container from "@duyet/components/Container";
import type { CategoryCount, Post } from "@duyet/interfaces";
import { getSlug } from "@duyet/libs/getSlug";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { HeroBanner } from "@/components/layout";
import { YearPost } from "@/components/post";
import {
  getCategoryColorClass,
  getCategoryMetadata,
} from "@/lib/category-metadata";
import { getAllCategories, getPostsByCategory } from "@/lib/posts";

export const Route = createFileRoute("/category/$category")({
  head: ({ params }) => {
    const { category } = params;
    return {
      meta: [
        { title: `${category} | Tôi là Duyệt` },
        {
          name: "description",
          content: `Blog posts in the ${category} category.`,
        },
      ],
    };
  },
  loader: async ({ params }) => {
    const [posts, categories] = await Promise.all([
      getPostsByCategory(params.category),
      getAllCategories(),
    ]);
    const found = Object.keys(categories).some(
      (cat) => getSlug(cat) === params.category
    );
    if (!found) throw notFound();
    return { posts, categories };
  },
  component: PostsByCategory,
});

function PostsByCategory() {
  const { category } = Route.useParams();
  const { posts, categories } = Route.useLoaderData() as {
    posts: Post[];
    categories: CategoryCount;
  };

  // Get the category display name (reverse slug to title)
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
    <div className="min-h-screen bg-[#f8f8f2] pb-14 dark:bg-[#0d0e0c]">
      <Container className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
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
              No posts found in this category yet.
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
