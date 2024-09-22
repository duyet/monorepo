import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import Link from 'next/link'

export function Skill({
  skill,
  url,
  icon,
}: {
  skill: string
  url?: string
  icon?: React.ReactNode
}) {
  if (!url && !icon) return skill
  if (url && !icon) return <Link href={url}>{skill}</Link>

  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger asChild>
        {url ? (
          <Link href={url} target="_blank" className="hover:underline">
            {skill}
          </Link>
        ) : (
          skill
        )}
      </HoverCardTrigger>
      <HoverCardContent>
        <div className="flex flex-col gap-2">
          {icon}{' '}
          {url ? (
            <Link href={url} target="_blank">
              Posts about <strong>{skill}</strong>
              {' →'}
            </Link>
          ) : (
            skill
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
