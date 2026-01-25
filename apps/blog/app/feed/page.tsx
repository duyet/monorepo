import Container from "@duyet/components/Container";
import Feed from "@duyet/components/Feed";
import Header from "@duyet/components/Header";
import { getAllPosts } from "@duyet/libs/getPost";
import Link from "next/link";

export const dynamic = "force-static";

type Params = Promise<Record<string, string>>;

async function getPosts(params: Params) {
  const { page } = await params;
  const pageNumber = page ? Number.parseInt(page, 10) - 1 : 0;

  return getAllPosts(
    [
      "date",
      "slug",
      "title",
      "excerpt",
      "thumbnail",
      "category",
      "category_slug",
    ],
    pageNumber * 10 + 10
  );
}

export default async function Page({ params }: { params: Params }) {
  const posts = await getPosts(params);

  return (
    <div className="min-h-screen">
      <Header center logo={false} longText="Data Engineering" />
      <Container>
        <Feed posts={posts} />

        <Link href="/archives?ref=home">
          <div className="mt-12 rounded-lg py-4 text-center text-base font-medium text-neutral-800 transition-colors hover:bg-neutral-100 hover:text-neutral-900 hover:underline hover:underline-offset-4">
            See more posts
          </div>
        </Link>
      </Container>
    </div>
  );
}
