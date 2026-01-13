declare module '*.mdx' {
  import type { MDXComponents } from 'mdx/types'

  export const metadata: {
    title: string
    date: string
    author?: string
    category?: string
    tags?: string[]
    description?: string
    slug: string
  }

  export default function MDXContent({
    components,
  }: {
    components?: MDXComponents
  }): JSX.Element
}
