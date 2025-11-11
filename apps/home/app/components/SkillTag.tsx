import Link from 'next/link'
import { SkillData } from '../lib/types'

interface SkillTagProps {
  skill: SkillData
}

export default function SkillTag({ skill }: SkillTagProps) {
  const baseClasses =
    'inline-block rounded-full bg-neutral-50 px-5 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700'

  if (skill.link) {
    return (
      <span className={baseClasses}>
        <Link
          href={skill.link}
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-neutral-900 dark:hover:text-neutral-50"
        >
          {skill.name}
        </Link>
      </span>
    )
  }

  return <span className={baseClasses}>{skill.name}</span>
}
