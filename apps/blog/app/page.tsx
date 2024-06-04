import Container from '@duyet/components/Container';
import Feed from '@duyet/components/Feed';
import Header from '@duyet/components/Header';
import { getAllPosts } from '@duyet/libs/getPost';

type Params = Record<string, string>;

async function getPosts(params: Params) {
  const page = params.page ? parseInt(params.page) - 1 : 0;

  return getAllPosts(
    [
      'date',
      'slug',
      'title',
      'excerpt',
      'thumbnail',
      'category',
      'category_slug',
    ],
    page * 10 + 10,
  );
}

export default async function Page({ params }: { params: Params }) {
  const posts = await getPosts(params);
  return (
    <>
      <Header center longText="Data Engineering" />
      <Container>
        <Feed posts={posts} />
      </Container>
    </>
  );
}
