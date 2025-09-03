'use client'

import { cn } from '@duyet/libs/utils'
import Image from 'next/image'
import { TextDataSource } from './TextDataSource'

interface StaticCardProps {
  title?: string
  source?: string
  url: {
    light: string
    dark: string
  }
  className?: string
  extra?: React.ReactNode
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
      className={cn('p-3', 'rounded border dark:border-gray-800', className)}
    >
      {title ? <div className="mb-5 font-bold">{title}</div> : null}

      <div className="block flex flex-col items-stretch dark:hidden">
        <Image
          alt={title || ''}
          height={500}
          loader={({ src }) => src}
          src={url.light}
          unoptimized
          width={800}
        />
      </div>

      <div className="flex hidden flex-col gap-5 dark:block">
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
  )
}

export default StaticCard
