import Link from 'next/link'
import AboutIcon from './components/icons/AboutIcon'
import AIIcon from './components/icons/AIIcon'
import BlogIcon from './components/icons/BlogIcon'
import HomelabIcon from './components/icons/HomelabIcon'
import InsightsIcon from './components/icons/InsightsIcon'
import PhotosIcon from './components/icons/PhotosIcon'
import ResumeIcon from './components/icons/ResumeIcon'

export const dynamic = 'force-static'
export const revalidate = 3600

/**
 * Add UTM tracking parameters to URL
 */
function addUtmParams(
  url: string,
  campaign: string = 'homepage',
  content?: string
): string {
  // Don't add UTM params to internal routes
  if (url.startsWith('/')) return url

  const urlObj = new URL(url)
  urlObj.searchParams.set('utm_source', 'home')
  urlObj.searchParams.set('utm_medium', 'website')
  urlObj.searchParams.set('utm_campaign', campaign)
  if (content) {
    urlObj.searchParams.set('utm_content', content)
  }
  return urlObj.toString()
}

export default function HomePage() {
  const links = [
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
      color: 'bg-terracotta-light',
      iconColor: 'text-neutral-900',
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
      color: 'bg-oat-light',
      iconColor: 'text-neutral-900',
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
      color: 'bg-cactus-light',
      iconColor: 'text-neutral-900',
    },
    {
      icon: HomelabIcon,
      title: 'Homelab',
      description:
        'Homelab monitoring dashboard (beta).',
      url: addUtmParams(
        process.env.NEXT_PUBLIC_DUYET_HOMELAB_URL ||
          'https://homelab.duyet.net',
        'homepage',
        'homelab_card'
      ),
      color: 'bg-lavender-light',
      iconColor: 'text-neutral-900',
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
      color: 'bg-cream',
      iconColor: 'text-neutral-900',
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
      color: 'bg-lavender-light',
      iconColor: 'text-neutral-900',
    },
    {
      icon: AboutIcon,
      title: 'About',
      description:
        'Learn more about my experience, skills, and professional background.',
      url: '/about',
      color: 'bg-ivory-light',
      iconColor: 'text-neutral-900',
    },
  ]

  return (
    <div className="flex min-h-screen items-center bg-neutral-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center sm:mb-12">
          <h1 className="mb-4 font-serif text-5xl font-normal text-neutral-900 sm:text-6xl">
            Duyet
          </h1>
          <p className="text-base leading-relaxed text-neutral-700 sm:text-lg">
            Data Engineering
          </p>
        </div>

        {/* Links Grid - Claude Style */}
        <div className="mb-8 grid gap-3 sm:mb-12 sm:grid-cols-2 lg:grid-cols-3">
          {/* Blog - Featured Large Card */}
          <Link
            href={links[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col p-6 ${links[0].color} rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg sm:col-span-2 lg:col-span-2`}
          >
            <div className={`mb-4 transition-transform duration-300 group-hover:scale-110 ${links[0].iconColor}`}>
              {(() => {
                const Icon = links[0].icon
                return <Icon />
              })()}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-900">
              {links[0].title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-700">
              {links[0].description}
            </p>
          </Link>

          {/* Resume */}
          <Link
            href={links[1].url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col p-6 ${links[1].color} rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className={`mb-4 transition-transform duration-300 group-hover:scale-110 ${links[1].iconColor}`}>
              {(() => {
                const Icon = links[1].icon
                return <Icon />
              })()}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-900">
              {links[1].title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-700">
              {links[1].description}
            </p>
          </Link>

          {/* Insights */}
          <Link
            href={links[2].url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col p-6 ${links[2].color} rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className={`mb-4 transition-transform duration-300 group-hover:scale-110 ${links[2].iconColor}`}>
              {(() => {
                const Icon = links[2].icon
                return <Icon />
              })()}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-900">
              {links[2].title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-700">
              {links[2].description}
            </p>
          </Link>

          {/* Homelab */}
          <Link
            href={links[3].url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col p-6 ${links[3].color} rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className={`mb-4 transition-transform duration-300 group-hover:scale-110 ${links[3].iconColor}`}>
              {(() => {
                const Icon = links[3].icon
                return <Icon />
              })()}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-900">
              {links[3].title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-700">
              {links[3].description}
            </p>
          </Link>

          {/* Photos */}
          <Link
            href={links[4].url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group relative flex flex-col p-6 ${links[4].color} overflow-hidden rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
          >
            {/* Background image on hover */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-0 transition-opacity duration-500 group-hover:opacity-100"
              style={{
                backgroundImage:
                  'url(https://images.unsplash.com/photo-1760809974561-545e45bea13e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872)',
              }}
            />
            {/* Overlay to maintain text readability */}
            <div className="absolute inset-0 bg-white/80 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

            {/* Content */}
            <div className="relative z-10">
              <div className={`mb-4 transition-transform duration-300 group-hover:scale-110 ${links[4].iconColor}`}>
                {(() => {
                  const Icon = links[4].icon
                  return <Icon />
                })()}
              </div>
              <h3 className="mb-2 text-xl font-semibold text-neutral-900">
                {links[4].title}
              </h3>
              <p className="text-sm leading-relaxed text-neutral-700">
                {links[4].description}
              </p>
            </div>
          </Link>

          {/* Chat */}
          <Link
            href={links[5].url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col p-6 ${links[5].color} rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className={`mb-4 transition-transform duration-300 group-hover:scale-110 ${links[5].iconColor}`}>
              {(() => {
                const Icon = links[5].icon
                return <Icon />
              })()}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-900">
              {links[5].title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-700">
              {links[5].description}
            </p>
          </Link>

          {/* About */}
          <Link
            href={links[6].url}
            rel="noopener noreferrer"
            className={`group flex flex-col p-6 ${links[6].color} rounded-3xl transition-all duration-300 hover:scale-[1.02] hover:shadow-lg`}
          >
            <div className={`mb-4 transition-transform duration-300 group-hover:scale-110 ${links[6].iconColor}`}>
              {(() => {
                const Icon = links[6].icon
                return <Icon />
              })()}
            </div>
            <h3 className="mb-2 text-xl font-semibold text-neutral-900">
              {links[6].title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-700">
              {links[6].description}
            </p>
          </Link>
        </div>

        {/* Social Links */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-neutral-600 sm:gap-10">
          <Link
            href={addUtmParams(
              'https://github.com/duyet',
              'homepage',
              'footer_github'
            )}
            target="_blank"
            className="transition-colors duration-200 hover:text-neutral-900"
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
            className="transition-colors duration-200 hover:text-neutral-900"
          >
            LinkedIn
          </Link>
          <Link
            href="/ls"
            className="transition-colors duration-200 hover:text-neutral-900"
          >
            Short URLs
          </Link>
          <a
            href="/llms.txt"
            className="transition-colors duration-200 hover:text-neutral-900"
          >
            llms.txt
          </a>
        </div>
      </div>
    </div>
  )
}
