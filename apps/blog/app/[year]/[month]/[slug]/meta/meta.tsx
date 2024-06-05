import Icons from '@duyet/components/Icons';
import type { Post } from '@duyet/interfaces';
import distanceToNow from '@duyet/libs/dateRelative';
import { getSeries } from '@duyet/libs/getSeries';
import { getSlug } from '@duyet/libs/getSlug';
import { cn } from '@duyet/libs/utils';
import Link from 'next/link';
import { SeriesBox } from '../../../../../components/series';

interface ContentProps {
  post: Post;
  className?: string;
}

export default function Content({ post, className }: ContentProps) {
  return (
    <div>
      <div
        className={cn(
          'flex flex-row flex-wrap gap-2',
          'text-sm text-gray-400',
          'px-3 py-5',
          'border-t border-gray-200 dark:border-gray-700',
          className,
        )}
      >
        <time>{post.date.toString()}</time>
        <time>({distanceToNow(new Date(post.date))})</time>
        <span>&#x2022;</span>
        <span>
          <Link href={`/category/${post.category_slug}`}>{post.category}</Link>
        </span>
        <span>&#x2022;</span>
        <span className="flex max-w-[200px] flex-row gap-2 truncate">
          {post.tags.map((tag) => (
            <Link href={`/tag/${getSlug(tag)}`} key={tag} title={`Tag: ${tag}`}>
              {tag}
            </Link>
          ))}
        </span>
        <span>&#x2022;</span>
        <a
          className="text-xs text-gray-400"
          href={post.edit_url}
          rel="noopener noreferrer"
          target="_blank"
          title="Edit in Github"
        >
          <Icons.Github className="h-4 w-4" />
        </a>
      </div>

      {Boolean(post.series) && (
        <SeriesBox
          current={post.slug}
          series={getSeries({ name: post.series })}
        />
      )}
    </div>
  );
}
