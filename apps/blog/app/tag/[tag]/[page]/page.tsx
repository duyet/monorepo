import { getAllTags } from "@duyet/libs/getPost";
import { getSlug } from "@duyet/libs/getSlug";
import { redirect } from "next/navigation";

export const dynamic = "force-static";
export const dynamicParams = false;

interface Params {
  tag: string;
  page: string;
}

interface PostsByTagWithPageProps {
  params: Promise<Params>;
}

export async function generateStaticParams() {
  const tags = getAllTags();
  const params: Params[] = [];

  // Generate minimal static params for backward compatibility
  // All pages will redirect to the main tag page
  Object.keys(tags).forEach((tag: string) => {
    params.push({
      tag: getSlug(tag),
      page: "1",
    });
  });

  return params;
}

export default async function PostsByTagWithPage({
  params,
}: PostsByTagWithPageProps) {
  const { tag } = await params;

  // Redirect to the main tag page which shows all posts in timeline view
  // This maintains backward compatibility while providing a better UX
  redirect(`/tag/${tag}`);
}
