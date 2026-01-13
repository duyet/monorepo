import React from 'react'
import { getAllPosts, getPostBySlug } from '@/lib/posts'
import { serialize } from 'next-mdx-remote/serialize'
import { MDXRemote } from 'next-mdx-remote/rsc'
import { ToolComparison, FeatureMatrix, WakaTimeChart, ToolTimeline, WorkflowDiagram, VersionDiff, ToolList } from '@/components/mdx'

interface PageProps {
  params: {
    slug: string
  }
}

const components = {
  ToolComparison,
  FeatureMatrix,
  WakaTimeChart,
  ToolTimeline,
  WorkflowDiagram,
  VersionDiff,
  ToolList,
}

export async function generateStaticParams() {
  const posts = getAllPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Post Not Found</h1>
        <p className="text-gray-600">The post you're looking for doesn't exist.</p>
      </div>
    )
  }

  // Serialize the MDX content
  const mdxSource = await serialize(post.content, {
    parseFrontmatter: true,
  })

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <header className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
        <div className="text-gray-600 mb-4">
          <time dateTime={post.date}>
            {new Date(post.date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </time>
        </div>
        {post.author && (
          <div className="text-gray-600">
            by {post.author}
          </div>
        )}
      </header>

      <div className="prose prose-lg max-w-none">
        <MDXRemote
          source={mdxSource.compiledSource}
          components={components}
        />
      </div>
    </article>
  )
}