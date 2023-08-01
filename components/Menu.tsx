import Link from 'next/link'

import { cn } from '../lib/utils'

const navigation = [
  { name: 'About', href: '/about' },
  { name: 'Insights', href: '/insights' },
  { name: 'Archives', href: '/archives' },
]

type Props = {
  className?: string
}

export default function Menu({ className }: Props) {
  return (
    <div className={cn('flex flex-row gap-5 flex-wrap', className)}>
      {navigation.map(({ name, href }) => (
        <Link
          key={name}
          href={href}
          className="hover:underline underline-offset-8"
        >
          {name}
        </Link>
      ))}
    </div>
  )
}
