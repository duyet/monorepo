import { cn } from '@duyet/libs'
import type { ImageProps } from 'next/image'
import Image from 'next/image'
import Link from 'next/link'

interface ExperienceItemProps {
  title: string
  company: string
  companyUrl?: string
  companyLogo?: ImageProps['src']
  companyLogoClassName?: string
  period: string
  responsibilities: (string | React.ReactNode)[]
  className?: string
}

export function ExperienceItem({
  title,
  company,
  companyUrl,
  companyLogo,
  companyLogoClassName,
  period,
  responsibilities,
  className,
}: ExperienceItemProps) {
  return (
    <div className={cn('flex flex-col gap-1', className)}>
      <h3
        className="inline-flex items-center gap-2 text-lg font-bold"
        style={{ fontFamily: 'var(--font-bodoni)' }}
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
    <span className="group inline-flex items-center gap-2 font-normal">
      {companyLogo ? (
        <Image
          src={companyLogo}
          alt={company}
          width={10}
          height={10}
          className={cn(
            'h-6 w-auto grayscale group-hover:grayscale-0',
            companyLogoClassName,
          )}
        />
      ) : null}
      {company}
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
