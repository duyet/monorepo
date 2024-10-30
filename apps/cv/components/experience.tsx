import { cn, distanceFormat } from '@duyet/libs'
import type { ImageProps } from 'next/image'
import Image from 'next/image'
import Link from 'next/link'

interface ExperienceItemProps {
  title: string
  company: string
  companyUrl?: string
  companyLogo?: ImageProps['src']
  companyLogoClassName?: string
  from: Date
  to?: Date
  responsibilities: { id: number; item: string | React.ReactNode }[]
  className?: string
}

export function ExperienceItem({
  title,
  company,
  companyUrl,
  companyLogo,
  companyLogoClassName,
  from,
  to,
  responsibilities,
  className,
}: ExperienceItemProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <h3
        className="inline-flex items-center gap-2 text-base font-bold"
        style={{ fontFamily: 'var(--font-lora)' }}
      >
        <span>{title}</span>
        <span>-</span>
        <CompanyLine
          company={company}
          companyUrl={companyUrl}
          companyLogo={companyLogo}
          companyLogoClassName={companyLogoClassName}
        />
      </h3>
      <PeriodLine from={from} to={to} />
      <ul className="ml-2 mt-2 list-disc pl-5 text-sm">
        {responsibilities.map(({ id, item }) => (
          <li className="mt-1" key={id}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}

function CompanyLine({
  company,
  companyUrl,
  companyLogo,
  companyLogoClassName,
}: Pick<
  ExperienceItemProps,
  'company' | 'companyUrl' | 'companyLogo' | 'companyLogoClassName'
>) {
  const logoWithText = (
    <span
      className={cn(
        'group inline-flex items-center gap-2 font-normal',
        'hover:underline hover:decoration-slate-300 hover:decoration-wavy hover:decoration-1 hover:underline-offset-4',
      )}
    >
      {companyLogo ? (
        <Image
          src={companyLogo}
          alt={company}
          width={10}
          height={10}
          className={cn(
            'h-6 w-auto grayscale group-hover:grayscale-0 print:hidden',
            companyLogoClassName,
          )}
        />
      ) : null}
      <span>{company}</span>
    </span>
  )

  if (companyUrl) {
    return (
      <Link href={companyUrl} className="m-0 p-0">
        {logoWithText}
      </Link>
    )
  }

  return logoWithText
}

function PeriodLine({ from, to }: { from: Date; to?: Date }) {
  const monthFmt = new Intl.DateTimeFormat('en-US', { month: 'long' })

  const fromString = `${monthFmt.format(from)} ${from.getFullYear()}`
  const toString = to ? `${monthFmt.format(to)} ${to.getFullYear()}` : 'CURRENT'
  const period = `${fromString} - ${toString}`

  const duration = distanceFormat(from, to ? to : new Date())

  return (
    <div className="group inline-flex gap-2 text-xs uppercase text-gray-600">
      <div className="hover:text-gray-700">{period}</div>
      <div className="hidden font-bold text-gray-400 group-hover:block">
        {duration}
      </div>
    </div>
  )
}
