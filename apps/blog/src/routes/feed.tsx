import Container from "@duyet/components/Container";
import Feed from "@duyet/components/Feed";
import Header from "@duyet/components/Header";
import { getAllPosts } from "@duyet/libs/getPost";
import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/feed")({
  component: FeedPage,
});

function FeedPage() {
  const posts = getAllPosts(
    [
      "date",
      "slug",
      "title",
      "excerpt",
      "thumbnail",
      "category",
      "category_slug",
    ],
    10
  );

  return (
    <div className="min-h-screen">
      <Header center logo={false} longText="Data Engineering" />
      <Container>
        <Feed posts={posts} />

        <Link to="/archives">
          <div className="mt-12 rounded-lg py-4 text-center text-base font-medium text-neutral-800 transition-colors hover:bg-neutral-100 hover:text-neutral-900 hover:underline hover:underline-offset-4">
            See more posts
          </div>
        </Link>
      </Container>
    </div>
  );
}
