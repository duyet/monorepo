import YearList from '@duyet/components/YearList'
import { getPostsByAllYear } from '@duyet/libs/getPost'
import { YearPost } from '../../components/year-post'

// Dynamic segments not included in generateStaticParams will return a 404.
// https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config#dynamicparams
export const dynamicParams = false

interface YearProps {
  params: Promise<{
    year: number
  }>
}

export default async function YearPage({ params }: YearProps) {
  const { year } = await params

  return (
    <>
      <YearPost year={year} />

      <div className="mt-10">
        <YearList />
      </div>
    </>
  )
}

export async function generateStaticParams() {
  const posts = getPostsByAllYear()

  return Object.keys(posts).map((year) => ({
    year,
  }))
}
