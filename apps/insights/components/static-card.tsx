import Image from 'next/image';
import { cn } from '@duyet/libs';
import TextDataSource from './text-data-source';

interface StaticCardProps {
  title?: string;
  source?: string;
  url: {
    light: string;
    dark: string;
  };
  className?: string;
  extra?: React.ReactNode;
}

export function StaticCard({
  title,
  source,
  url,
  className,
  extra,
}: StaticCardProps) {
  return (
    <div
      className={cn('p-3', 'border rounded dark:border-gray-800', className)}
    >
      {title ? <div className="font-bold mb-5">{title}</div> : null}

      <div className="flex flex-col items-stretch block dark:hidden">
        <Image
          alt={title || ''}
          height={500}
          src={url.light}
          unoptimized
          width={800}
        />
      </div>

      <div className="flex flex-col gap-5 hidden dark:block">
        <Image
          alt={title || ''}
          height={500}
          src={url.dark}
          unoptimized
          width={800}
        />
      </div>

      {extra}

      <TextDataSource>{source}</TextDataSource>
    </div>
  );
}

export default StaticCard;
