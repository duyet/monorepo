import Link from 'next/link'
import { LinkCard, ContentCard } from '@duyet/components'
import { nodes } from '../../homelab/lib/data/nodes'

export const dynamic = 'force-static'
export const revalidate = 3600

// Extract node names from homelab data (limit to 3, add "..." if more exist)
const homelabNodes = nodes.length > 3
  ? [...nodes.slice(0, 3).map((node) => node.name), '...']
  : nodes.map((node) => node.name)

// Build date for resume card
const buildDate = new Date().toISOString().split('T')[0] // Format: YYYY-MM-DD

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
  return (
    <div className="geometric-bg flex min-h-screen items-center">
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:py-24">
        {/* Hero Section */}
        <header className="mb-16 text-center sm:mb-20">
          <h1 className="hero-title mb-6 font-serif text-6xl font-medium tracking-tight sm:text-7xl md:text-8xl">
            Duyet
          </h1>
          <p className="text-lg font-light tracking-wide text-neutral-600 sm:text-xl">
            Data Engineering
          </p>
          <div className="mx-auto mt-6 h-px w-16 bg-gradient-to-r from-transparent via-neutral-300 to-transparent" />
        </header>

        {/* Links Grid */}
        <main className="mb-16 grid gap-4 sm:mb-20 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card-entrance animation-delay-100">
            <ContentCard
              title="Blog"
              href={addUtmParams(
                process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net',
                'homepage',
                'blog_card'
              )}
              description="Technical writings on data engineering, distributed systems, and open source."
              color="terracotta"
              illustration="blob"
              featured
            />
          </div>

          <div className="card-entrance animation-delay-200">
            <ContentCard
              title="Resume"
              href={addUtmParams(
                process.env.NEXT_PUBLIC_DUYET_CV_URL || 'https://cv.duyet.net',
                'homepage',
                'resume_card'
              )}
              category={`Updated ${buildDate}`}
              description="Experience building scalable data infrastructure and leading engineering teams."
              color="oat"
              illustration="wavy"
            />
          </div>

          <div className="card-entrance animation-delay-300">
            <ContentCard
              title="Insights"
              href={addUtmParams(
                process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL ||
                  'https://insights.duyet.net',
                'homepage',
                'insights_card'
              )}
              description="Analytics dashboard showcasing data from GitHub, WakaTime, and more."
              color="cactus"
              tags={['Coding Stats', 'Website Traffic', 'LLM Token Usage']}
              illustration="wavy"
            />
          </div>

          <div className="card-entrance animation-delay-400">
            <ContentCard
              title="Homelab"
              href={addUtmParams(
                process.env.NEXT_PUBLIC_DUYET_HOMELAB_URL ||
                  'https://homelab.duyet.net',
                'homepage',
                'homelab_card'
              )}
              description="Homelab monitoring dashboard (beta)."
              color="lavender"
              tags={homelabNodes}
              illustration="geometric"
            />
          </div>

          <div className="card-entrance animation-delay-500">
            <LinkCard
              title="Photos"
              href={addUtmParams(
                process.env.NEXT_PUBLIC_DUYET_PHOTOS_URL ||
                  'https://photos.duyet.net',
                'homepage',
                'photos_card'
              )}
              description="Photography portfolio and visual stories from travels and daily life."
              color="cream"
              backgroundImage="https://images.unsplash.com/photo-1760809974561-545e45bea13e?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=872"
            />
          </div>

          <div className="card-entrance animation-delay-600">
            <LinkCard
              title="Chat"
              href={addUtmParams(
                process.env.NEXT_PUBLIC_DUYET_AI_URL || 'https://ai.duyet.net',
                'homepage',
                'ai_card'
              )}
              description="Experimental @duyetbot LLM base for questions about duyet.net and related topics."
              color="sage"
            />
          </div>

          <div className="card-entrance animation-delay-600">
            <LinkCard
              title="About"
              href="/about"
              description="Learn more about my experience, skills, and professional background."
              color="ivory"
            />
          </div>
        </main>

        {/* Footer Links */}
        <footer className="flex flex-wrap justify-center gap-8 text-sm font-medium text-neutral-500 sm:gap-12">
          <Link
            href={addUtmParams(
              'https://github.com/duyet',
              'homepage',
              'footer_github'
            )}
            target="_blank"
            className="footer-link transition-colors duration-300 hover:text-neutral-900"
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
            className="footer-link transition-colors duration-300 hover:text-neutral-900"
          >
            LinkedIn
          </Link>
          <Link
            href="/ls"
            className="footer-link transition-colors duration-300 hover:text-neutral-900"
          >
            Short URLs
          </Link>
          <a
            href="/llms.txt"
            className="footer-link transition-colors duration-300 hover:text-neutral-900"
          >
            llms.txt
          </a>
          <Link
            href={addUtmParams(
              'https://status.duyet.net',
              'homepage',
              'footer_status'
            )}
            target="_blank"
            className="footer-link transition-colors duration-300 hover:text-neutral-900"
          >
            Status
          </Link>
        </footer>
      </div>
    </div>
  )
}
