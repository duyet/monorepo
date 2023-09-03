import Link from 'next/link';
import { Github } from 'lucide-react';
import { cn } from '@duyet/libs/utils';
import type { Post } from '@duyet/interfaces';
import distanceToNow from '@duyet/libs/dateRelative';

interface ContentProps {
  post: Post;
  className?: string;
}

export default function Content({ post, className }: ContentProps) {
  const tags = post.tags?.join(', ');

  return (
    <div
      className={cn(
        'flex flex-row flex-wrap gap-2 text-gray-400 text-sm py-5 px-3',
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
      <span className="truncate max-w-[200px]" title={`Tags: ${tags}`}>
        {tags}
      </span>
      <span>&#x2022;</span>
      <a
        className="text-xs text-gray-400"
        href={post.edit_url}
        rel="noopener noreferrer"
        target="_blank"
        title="Edit in Github"
      >
        <Github size={20} strokeWidth={1} />
      </a>
    </div>
  );
}
