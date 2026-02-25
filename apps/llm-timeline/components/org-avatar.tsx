'use client'

import { useState } from 'react'
import { getOrgLogoUrl, getOrgInitials, getOrgColor } from '@/lib/org-logos'
import { cn } from '@duyet/libs/utils'

interface OrgAvatarProps {
  org: string
  size?: 'sm' | 'md'
}

export function OrgAvatar({ org, size = 'sm' }: OrgAvatarProps) {
  const [logoError, setLogoError] = useState(false)
  const logoUrl = getOrgLogoUrl(org)
  const initials = getOrgInitials(org)
  const colorClass = getOrgColor(org)
  const sizeClass = size === 'sm' ? 'h-6 w-6 text-[9px]' : 'h-8 w-8 text-xs'

  if (logoUrl && !logoError) {
    return (
      <img
        src={logoUrl}
        alt={`${org} logo`}
        width={size === 'sm' ? 24 : 32}
        height={size === 'sm' ? 24 : 32}
        className={cn('rounded-md object-contain', sizeClass)}
        onError={() => setLogoError(true)}
      />
    )
  }

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-md font-semibold',
        sizeClass,
        colorClass,
      )}
      title={org}
    >
      {initials}
    </div>
  )
}
