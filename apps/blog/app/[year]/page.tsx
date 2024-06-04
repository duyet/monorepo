import YearList from '@duyet/components/YearList';
import { getPostsByAllYear } from '@duyet/libs/getPost';
import { Year } from '../../components/year';

// Dynamic segments not included in generateStaticParams will return a 404.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams
export const dynamicParams = false;

interface YearProps {
  params: {
    year: number;
  };
}

export default function YearPage({ params: { year } }: YearProps) {
  return (
    <>
      <Year year={year} />

      <div className="mt-10">
        <YearList />
      </div>
    </>
  );
}

export async function generateStaticParams() {
  const posts = getPostsByAllYear();

  return Object.keys(posts).map((year) => ({
    year,
  }));
}
