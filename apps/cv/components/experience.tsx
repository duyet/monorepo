import { cn } from '@duyet/libs'
import { ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ExperienceItemProps {
  title: string
  company: string
  companyUrl?: string
  period: string
  responsibilities: (string | React.ReactNode)[]
  className?: string
}

export function ExperienceItem({
  title,
  company,
  companyUrl,
  period,
  responsibilities,
  className,
}: ExperienceItemProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <h3
        className="text-lg font-bold"
        style={{ fontFamily: 'var(--font-bodoni)' }}
      >
        {title} -{' '}
        {companyUrl ? (
          <Link className="font-normal" href={companyUrl}>
            {company}
            <ExternalLink className="inline-block h-4 w-4" />
          </Link>
        ) : (
          <span className="font-normal">{company}</span>
        )}
      </h3>
      <p className="text-xs uppercase text-gray-600">{period}</p>
      <ul className="ml-2 mt-2 list-disc pl-5 text-sm">
        {responsibilities.map((item) => (
          <li className="mt-1" key={item?.toString()}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
