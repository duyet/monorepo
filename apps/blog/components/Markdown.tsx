import { cn } from '@duyet/libs/utils'
import { compile, run } from '@mdx-js/mdx'
import { Fragment, type ReactElement, use } from 'react'
import * as runtime from 'react/jsx-runtime'
import remarkGfm from 'remark-gfm'
import { mdxComponents } from '@/components/MdxComponents'

type MDXComponent = React.ComponentType<{ components?: typeof mdxComponents }>

// Compiled-component cache keyed by source, so re-renders don't recompile.
const cache = new Map<string, Promise<MDXComponent>>()

async function compileMarkdown(source: string): Promise<MDXComponent> {
  const code = await compile(source, {
    outputFormat: 'function-body',
    remarkPlugins: [remarkGfm],
  })
  const { default: MDXContent } = await run(String(code), {
    ...runtime,
    Fragment,
    baseUrl: import.meta.url,
  })
  return MDXContent as MDXComponent
}

/**
 * Render a markdown string with the shared MDX component set. Suspends while the
 * source compiles, so render inside a <Suspense> boundary.
 */
export function Markdown({
  source,
  className,
}: {
  source: string
  className?: string
}): ReactElement {
  if (!cache.has(source)) {
    cache.set(source, compileMarkdown(source))
  }
  const MDXContent = use(cache.get(source)!)

  return (
    <div className={cn('prose dark:prose-invert max-w-none', className)}>
      <MDXContent components={mdxComponents} />
    </div>
  )
}
