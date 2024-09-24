'use client'

import * as seline from '@seline-analytics/web'
import Link from 'next/link'

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'

export function HoverLinks({
  text,
  links,
}: {
  text: string
  links: { text: string; href: string }[]
}) {
  return (
    <HoverCard
      openDelay={100}
      closeDelay={100}
      onOpenChange={(open: boolean) => {
        if (open) seline.track('CV: Hover Link', { text })
      }}
    >
      <HoverCardTrigger asChild>
        <span className="cursor-context-menu underline decoration-slate-300 decoration-wavy decoration-1 underline-offset-4">
          {text}
        </span>
      </HoverCardTrigger>
      <HoverCardContent asChild>
        <div className="w-fit p-2">
          <div className="mb-4 font-bold">Some of posts:</div>
          <ul className="ml-4 list-disc">
            {links.map((link) => (
              <li key={link.text} className="mb-1">
                <Link href={link.href} target="_blank">
                  {link.text} ↗︎
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
