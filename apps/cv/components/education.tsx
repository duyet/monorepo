import { cn } from '@duyet/libs'
import Link from 'next/link'

interface EducationProps {
  major: string
  university: string
  period?: string
  thesis: string
  thesisUrl: string
  className?: string
}

export function Education({
  major,
  university,
  period,
  thesis,
  thesisUrl,
  className,
}: EducationProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <h3
        className="text-base font-bold"
        style={{ fontFamily: 'var(--font-lora)' }}
      >
        {major}
        <span className="px-2">-</span>
        <span className="font-normal">{university}</span>
      </h3>
      <p className="text-xs uppercase text-gray-600">{period}</p>
      <Link
        href={thesisUrl}
        className="hover:underline hover:decoration-slate-300 hover:decoration-wavy hover:decoration-1 hover:underline-offset-4"
      >
        {thesis} ↗︎
      </Link>
    </div>
  )
}
