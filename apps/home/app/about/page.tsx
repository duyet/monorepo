import Link from 'next/link'
import ResumeIcon from '../components/icons/ResumeIcon'
import GithubIcon from '../components/icons/GithubIcon'
import LinkedInIcon from '../components/icons/LinkedInIcon'
import BlogIcon from '../components/icons/BlogIcon'
import LinkCard from '../components/LinkCard'
import SkillTag from '../components/SkillTag'
import { addUtmParams } from '../lib/utils'
import { LinkCardData, SkillData } from '../lib/types'

export const dynamic = 'force-static'

export default function About() {
  const BLOG_URL =
    process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net'

  const links: LinkCardData[] = [
    {
      icon: ResumeIcon,
      title: 'Resume',
      description:
        'Experience building scalable data infrastructure and leading engineering teams.',
      url: addUtmParams('https://cv.duyet.net', 'about_page', 'resume_card'),
      variant: 'elevated',
      iconColor: 'text-claude-copper dark:text-orange-300',
    },
    {
      icon: GithubIcon,
      title: 'GitHub',
      description:
        'Open source contributions and personal projects in Python, Rust, and TypeScript.',
      url: addUtmParams('https://github.com/duyet', 'about_page', 'github_card'),
      variant: 'outlined',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: LinkedInIcon,
      title: 'LinkedIn',
      description:
        'Professional network and career highlights in data engineering.',
      url: addUtmParams(
        'https://linkedin.com/in/duyet',
        'about_page',
        'linkedin_card'
      ),
      variant: 'glass',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: BlogIcon,
      title: 'Blog',
      description:
        'Technical writings on data engineering, distributed systems, and open source.',
      url: addUtmParams(BLOG_URL, 'about_page', 'blog_card'),
      color:
        'bg-claude-beige dark:bg-orange-950/30 hover:bg-claude-tan dark:hover:bg-orange-950/40',
      iconColor: 'text-claude-brown dark:text-orange-200',
    },
  ]

  const skills: SkillData[] = [
    {
      name: 'Python',
      link: addUtmParams(
        'https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=python',
        'about_page',
        'skill_python'
      ),
    },
    {
      name: 'Rust',
      link: addUtmParams(
        'https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=rust',
        'about_page',
        'skill_rust'
      ),
    },
    {
      name: 'Javascript',
      link: addUtmParams(
        'https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=javascript',
        'about_page',
        'skill_javascript'
      ),
    },
    { name: 'Spark' },
    {
      name: 'Airflow',
      link: addUtmParams(
        `${BLOG_URL}/tag/airflow/`,
        'about_page',
        'skill_airflow'
      ),
    },
    { name: 'AWS' },
    { name: 'GCP' },
  ]

  return (
    <div className="min-h-screen bg-claude-cream dark:bg-neutral-950">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-6 font-serif text-5xl font-normal text-claude-black dark:text-neutral-100 sm:text-6xl">
            About
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-claude-gray-700 dark:text-neutral-300">
            Data Engineer with 6+ years of experience. I am confident in my
            knowledge of Data Engineering concepts, best practices and
            state-of-the-art data and Cloud technologies.
          </p>
        </div>

        {/* Links Grid */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link, index) => (
            <div key={`${link.title}-${index}`} className="flex">
              <LinkCard data={link} />
            </div>
          ))}
        </div>

        {/* Skills Section */}
        <div className="rounded-3xl bg-gradient-to-br from-neutral-50 to-neutral-100 p-8 dark:from-neutral-900 dark:to-neutral-800 sm:p-12">
          <h2 className="mb-6 font-serif text-3xl font-normal text-claude-black dark:text-neutral-100">
            Skills & Stacks
          </h2>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <SkillTag key={skill.name} skill={skill} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
