import type { Post } from '@duyet/interfaces'
import { getAllPosts } from '@duyet/libs/getPost'
import { NextResponse } from 'next/server'

export const dynamic = 'force-static'

export async function GET() {
  const posts = getAllPosts(['slug', 'title', 'date', 'category', 'tags', 'excerpt'], 100000)
  
  const llmsContent = `# Duyet Le - Technical Blog

A comprehensive collection of technical blog posts covering Data Engineering, Software Engineering, and Technology insights from Duyet Le.

## Contact
- Author: Duyet Le
- Email: me@duyet.net
- Website: https://duyet.net
- GitHub: https://github.com/duyet
- LinkedIn: https://linkedin.com/in/duyet
- Blog: https://blog.duyet.net

## About This Blog

${posts.length}+ technical articles covering topics including:
- Data Engineering & Big Data
- Apache Spark, ClickHouse, Apache Airflow
- Cloud Computing (AWS, GCP, Azure)
- Kubernetes & DevOps
- Programming (Python, Rust, JavaScript/TypeScript)
- Machine Learning & AI
- Software Engineering Best Practices

Articles span from ${new Date(posts[posts.length - 1]?.date).getFullYear()} to ${new Date(posts[0]?.date).getFullYear()}, documenting the evolution of modern data engineering and software development practices.

## Recent Posts

${posts.slice(0, 20).map((post: Post) => {
  const url = `https://blog.duyet.net${post.slug}`
  const date = new Date(post.date).toISOString().split('T')[0]
  const tags = post.tags?.join(', ') || ''
  
  return `### [${post.title}](${url})
- **Date**: ${date}
- **Category**: ${post.category}
- **Tags**: ${tags}
- **URL**: ${url}
${post.excerpt ? `- **Description**: ${post.excerpt}` : ''}
`
}).join('\n')}

## All Blog Posts by Year

${Object.entries(
  posts.reduce((acc: Record<string, Post[]>, post: Post) => {
    const year = new Date(post.date).getFullYear().toString()
    if (!acc[year]) acc[year] = []
    acc[year].push(post)
    return acc
  }, {})
).sort(([a], [b]) => parseInt(b) - parseInt(a))
.map(([year, yearPosts]) => {
  return `### ${year} (${yearPosts.length} posts)

${yearPosts.map((post: Post) => {
  const url = `https://blog.duyet.net${post.slug}`
  const date = new Date(post.date).toISOString().split('T')[0]
  return `- [${post.title}](${url}) - ${date}`
}).join('\n')}
`
}).join('\n')}

## Popular Topics

The blog covers these main technical areas with substantial content:

### Data Engineering
- ClickHouse: Database optimization, Kubernetes deployment, performance tuning
- Apache Spark: Kubernetes integration, performance optimization, data processing
- Apache Airflow: Workflow management, best practices, monitoring

### Cloud & DevOps  
- Kubernetes: Container orchestration, monitoring, production deployments
- Cloud Platforms: AWS, GCP, Azure architecture and cost optimization
- CI/CD: GitHub Actions, automated testing, deployment strategies

### Programming Languages
- Rust: Systems programming, data engineering tools, performance optimization
- Python: Data processing, web development, automation scripts
- JavaScript/TypeScript: Web development, Node.js, modern frameworks

### Machine Learning & AI
- Natural Language Processing: Text analysis, sentiment analysis, tokenization
- Deep Learning: Model deployment, training optimization, production ML
- Data Science: Statistical analysis, visualization, data mining

---

This file follows the llms.txt standard for providing comprehensive blog information to Large Language Models and AI assistants.

**Blog Statistics:**
- Total Posts: ${posts.length}
- Years Active: ${new Date(posts[posts.length - 1]?.date).getFullYear()}-${new Date(posts[0]?.date).getFullYear()}
- Categories: ${Array.from(new Set(posts.map(p => p.category))).length}
- Tags: ${Array.from(new Set(posts.flatMap(p => p.tags || []))).length}

Generated from: https://blog.duyet.net
`

  return new NextResponse(llmsContent, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}