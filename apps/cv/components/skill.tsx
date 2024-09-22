import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import Link from 'next/link'
import React from 'react'

export function Skill({
  skill,
  url,
  icon,
  note,
}: {
  skill: string
  url?: string
  icon?: React.ReactNode
  note?: string | React.ReactNode
}) {
  if (!url && !icon && !note) return skill
  if (url && !icon)
    return (
      <Link
        href={url}
        target="_blank"
        className="hover:underline hover:decoration-slate-300 hover:decoration-wavy hover:decoration-1 hover:underline-offset-4"
      >
        {skill}
      </Link>
    )

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        {url ? (
          <Link
            href={url}
            target="_blank"
            className="hover:underline hover:decoration-slate-300 hover:decoration-wavy hover:decoration-1 hover:underline-offset-4"
          >
            {skill}
          </Link>
        ) : (
          <span>{skill}</span>
        )}
      </HoverCardTrigger>
      <HoverCardContent asChild>
        <div className="flex flex-col gap-2">
          {icon}{' '}
          {url ? (
            <Link href={url} target="_blank">
              Posts about <strong>{skill}</strong>
              {' ↗︎'}
            </Link>
          ) : (
            skill
          )}
          {note ? <div className="mt-2">{note}</div> : null}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
