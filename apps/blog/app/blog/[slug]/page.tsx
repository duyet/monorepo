import React from 'react'
import { getPostBySlug, getAllPosts } from '@/lib/posts'

interface PageProps {
  params: {
    slug: string
  }
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

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug)

  if (!post) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8">Post Not Found</h1>
        <p className="text-gray-600">The post you're looking for doesn't exist.</p>
      </div>
    )
  }

  // Simple MDX rendering - for now, just show the content as HTML
  // In a real implementation, you would use a proper MDX renderer
  const contentHtml = post.content
    .replace(/<ToolComparison.*?<\/ToolComparison>/gs, '<div class="tool-comparison-placeholder">Tool Comparison Component</div>')
    .replace(/<FeatureMatrix.*?<\/FeatureMatrix>/gs, '<div class="feature-matrix-placeholder">Feature Matrix Component</div>')
    .replace(/<WakaTimeChart.*?<\/WakaTimeChart>/gs, '<div class="chart-placeholder">WakaTime Chart Component</div>')
    .replace(/<ToolTimeline.*?<\/ToolTimeline>/gs, '<div class="timeline-placeholder">Tool Timeline Component</div>')
    .replace(/<WorkflowDiagram.*?<\/WorkflowDiagram>/gs, '<div class="workflow-placeholder">Workflow Diagram Component</div>')
    .replace(/<VersionDiff.*?<\/VersionDiff>/gs, '<div class="diff-placeholder">Version Diff Component</div>')
    .replace(/<ToolList.*?<\/ToolList>/gs, '<div class="tool-list-placeholder">Tool List Component</div>')

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

      <div
        className="prose prose-lg max-w-none"
        dangerouslySetInnerHTML={{ __html: contentHtml }}
      />
    </article>
  )
}