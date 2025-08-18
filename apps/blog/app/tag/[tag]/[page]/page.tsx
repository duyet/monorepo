import Link from 'next/link'
import { notFound } from 'next/navigation'

import Feed from '@duyet/components/Feed'
import { getAllTags, getPostsByTag } from '@duyet/libs/getPost'
import { getSlug } from '@duyet/libs/getSlug'

export const dynamic = 'force-static'

interface Params {
  tag: string
  page: string
}

interface PostsByTagWithPageProps {
  params: Promise<Params>
}

const POSTS_PER_PAGE = 10

export default async function PostsByTagWithPage({ params }: PostsByTagWithPageProps) {
  const { tag, page } = await params
  const pageNumber = parseInt(page, 10)
  
  if (isNaN(pageNumber) || pageNumber < 1) {
    notFound()
  }

  const allPosts = await getAllPostsByTag(tag)
  const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE)
  
  if (pageNumber > totalPages && totalPages > 0) {
    notFound()
  }

  const startIndex = (pageNumber - 1) * POSTS_PER_PAGE
  const endIndex = startIndex + POSTS_PER_PAGE
  const posts = allPosts.slice(startIndex, endIndex)

  return (
    <div>
      <h1 className="mb-16">
        Showing posts {startIndex + 1}-{Math.min(endIndex, allPosts.length)} of {allPosts.length} from {tag} topic 
        (Page {pageNumber} of {totalPages}). 
        Checking out <Link href="/tags">all my favorite topics here</Link>.
      </h1>
      
      <Feed posts={posts} noThumbnail />
      
      {totalPages > 1 && (
        <div className="mt-16 flex justify-center items-center gap-4">
          {pageNumber > 1 && (
            <Link 
              href={`/tag/${tag}/${pageNumber - 1}`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Previous
            </Link>
          )}
          
          <span className="text-gray-600">
            Page {pageNumber} of {totalPages}
          </span>
          
          {pageNumber < totalPages && (
            <Link 
              href={`/tag/${tag}/${pageNumber + 1}`}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Next
            </Link>
          )}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <Link href={`/tag/${tag}`} className="text-blue-600 hover:underline">
          View all posts for "{tag}" (unpaginated)
        </Link>
      </div>
    </div>
  )
}

async function getAllPostsByTag(tag: Params['tag']) {
  return getPostsByTag(tag, [
    'slug',
    'date',
    'title',
    'excerpt',
    'category',
    'thumbnail',
  ])
}

export async function generateStaticParams() {
  const tags = getAllTags()
  const params: Params[] = []

  Object.keys(tags).forEach((tag: string) => {
    const allPosts = getPostsByTag(tag, ['slug'])
    const totalPages = Math.ceil(allPosts.length / POSTS_PER_PAGE)
    
    // Generate pages for each tag
    for (let page = 1; page <= totalPages; page++) {
      params.push({
        tag: getSlug(tag),
        page: page.toString(),
      })
    }
  })

  return params
}