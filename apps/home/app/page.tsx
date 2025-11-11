import Link from 'next/link'
import AboutIcon from './components/icons/AboutIcon'
import AIIcon from './components/icons/AIIcon'
import BlogIcon from './components/icons/BlogIcon'
import HomelabIcon from './components/icons/HomelabIcon'
import InsightsIcon from './components/icons/InsightsIcon'
import PhotosIcon from './components/icons/PhotosIcon'
import ResumeIcon from './components/icons/ResumeIcon'
import LinkCard from './components/LinkCard'
import { addUtmParams } from './lib/utils'
import { LinkCardData } from './lib/types'

export const dynamic = 'force-static'
export const revalidate = 3600

export default function HomePage() {
  const links: LinkCardData[] = [
    {
      icon: BlogIcon,
      title: 'Blog',
      description:
        'Technical writings on data engineering, distributed systems, and open source.',
      url: addUtmParams(
        process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net',
        'homepage',
        'blog_card'
      ),
      color:
        'bg-claude-beige dark:bg-orange-950/30 hover:bg-claude-tan dark:hover:bg-orange-950/40',
      iconColor: 'text-claude-brown dark:text-orange-200',
      featured: true,
    },
    {
      icon: ResumeIcon,
      title: 'Resume',
      description:
        'Experience building scalable data infrastructure and leading engineering teams.',
      url: addUtmParams(
        process.env.NEXT_PUBLIC_DUYET_CV_URL || 'https://cv.duyet.net',
        'homepage',
        'resume_card'
      ),
      variant: 'elevated',
      iconColor: 'text-claude-copper dark:text-amber-300',
    },
    {
      icon: InsightsIcon,
      title: 'Insights',
      description:
        'Analytics dashboard showcasing data from GitHub, WakaTime, and more.',
      url: addUtmParams(
        process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL ||
          'https://insights.duyet.net',
        'homepage',
        'insights_card'
      ),
      variant: 'glass',
      iconColor: 'text-emerald-600 dark:text-emerald-400',
    },
    {
      icon: HomelabIcon,
      title: 'Homelab',
      description: 'Homelab monitoring dashboard (beta).',
      url: addUtmParams(
        process.env.NEXT_PUBLIC_DUYET_HOMELAB_URL ||
          'https://homelab.duyet.net',
        'homepage',
        'homelab_card'
      ),
      variant: 'outlined',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
    {
      icon: PhotosIcon,
      title: 'Photos',
      description:
        'Photography portfolio and visual stories from travels and daily life.',
      url: addUtmParams(
        process.env.NEXT_PUBLIC_DUYET_PHOTOS_URL || 'https://photos.duyet.net',
        'homepage',
        'photos_card'
      ),
      variant: 'gradient',
      iconColor: 'text-pink-600 dark:text-pink-400',
      backgroundImage:
        'https://images.unsplash.com/photo-1760809974561-545e45bea13e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872',
    },
    {
      icon: AIIcon,
      title: 'Chat',
      description:
        'Ask me anything. AI-powered chatbot for questions about duyet.net and related topics.',
      url: addUtmParams(
        process.env.NEXT_PUBLIC_DUYET_AI_URL || 'https://ai.duyet.net',
        'homepage',
        'ai_card'
      ),
      color:
        'bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-950/40',
      iconColor: 'text-blue-600 dark:text-blue-400',
    },
    {
      icon: AboutIcon,
      title: 'About',
      description:
        'Learn more about my experience, skills, and professional background.',
      url: '/about',
      variant: 'elevated',
      iconColor: 'text-claude-gray-700 dark:text-neutral-300',
    },
  ]

  return (
    <div className="flex min-h-screen items-center bg-claude-cream dark:bg-neutral-950">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-12">
          <h1 className="mb-4 font-serif text-5xl font-normal text-claude-black dark:text-neutral-100 sm:text-6xl">
            Duyet
          </h1>
          <p className="text-base leading-relaxed text-claude-gray-700 dark:text-neutral-300 sm:text-lg">
            Data Engineering
          </p>
        </div>

        {/* Links Grid */}
        <div className="mb-8 grid gap-3 sm:mb-12 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link, index) => (
            <LinkCard
              key={`${link.title}-${index}`}
              data={link}
              featured={link.featured}
            />
          ))}
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-10 text-sm font-medium text-claude-gray-600 dark:text-neutral-400">
          <Link
            href={addUtmParams(
              'https://github.com/duyet',
              'homepage',
              'footer_github'
            )}
            target="_blank"
            className="transition-colors duration-200 hover:text-claude-black dark:hover:text-neutral-100"
          >
            GitHub
          </Link>
          <Link
            href={addUtmParams(
              'https://linkedin.com/in/duyet',
              'homepage',
              'footer_linkedin'
            )}
            target="_blank"
            className="transition-colors duration-200 hover:text-claude-black dark:hover:text-neutral-100"
          >
            LinkedIn
          </Link>
          <a
            href="/llms.txt"
            className="transition-colors duration-200 hover:text-claude-black dark:hover:text-neutral-100"
          >
            llms.txt
          </a>
        </div>
      </div>
    </div>
  )
}
