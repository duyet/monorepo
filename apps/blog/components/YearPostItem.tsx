/**
 * YearPostItem Component - Individual post item in year list
 * Extracted from YearPost for better modularity and enhanced design
 */

import Link from 'next/link'
import type { Post } from '@duyet/interfaces'
import { dateFormat } from '@duyet/libs/date'
import { cn } from '@duyet/libs/utils'
import { PostStatus } from './PostStatus'

export interface YearPostItemProps {
  post: Post
  className?: string
}

export function YearPostItem({ post, className }: YearPostItemProps) {
  return (
    <article
      className={cn(
        'flex flex-row items-center gap-4 group hover:bg-muted/50 rounded-lg p-2 -mx-2 transition-colors',
        className
      )}
    >
      <div className="flex-1 min-w-0">
        <Link 
          as={post.slug} 
          className="text-md hover:underline hover:text-primary transition-colors" 
          href="/[...slug]"
        >
          <span className="group-hover:font-medium transition-all">
            {post.title}
          </span>
        </Link>
        
        <PostStatus 
          date={post.date} 
          featured={post.featured}
          className="mt-1"
        />
      </div>
      
      <hr className="shrink grow border-dotted border-slate-200 opacity-50 mx-2" />
      
      <time className="flex-shrink-0 text-sm font-mono text-muted-foreground whitespace-nowrap">
        {dateFormat(post.date, 'MMM dd')}
      </time>
    </article>
  )
}