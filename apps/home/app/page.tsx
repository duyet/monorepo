'use client'

import Link from 'next/link'
import { LinkCard, ContentCard } from '@duyet/components'
import { nodes } from '../../homelab/lib/data/nodes'
import { motion } from 'framer-motion'

// Note: revalidate and dynamic should be in a separate route segment config

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

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

const headerVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
}

export default function HomePage() {
  return (
    <div className="flex min-h-screen items-center">
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:py-16">
        {/* Header */}
        <motion.div
          className="mb-10 text-center sm:mb-14"
          initial="hidden"
          animate="visible"
          variants={headerVariants}
        >
          <h1 className="mb-3 font-serif text-6xl italic tracking-tight sm:text-7xl"
              style={{ color: 'var(--color-text-primary)' }}>
            Duyet
          </h1>
          <p className="text-lg tracking-wide"
             style={{ color: 'var(--color-text-secondary)' }}>
            Data Engineering
          </p>
        </motion.div>

        {/* Links Grid */}
        <motion.div
          className="mb-10 grid gap-4 sm:mb-14 sm:grid-cols-2 lg:grid-cols-3"
          initial="hidden"
          animate="visible"
          variants={containerVariants}
        >
          <motion.div variants={itemVariants} className="sm:col-span-2">
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
          </motion.div>

          <motion.div variants={itemVariants}>
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
          </motion.div>

          <motion.div variants={itemVariants}>
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
          </motion.div>

          <motion.div variants={itemVariants}>
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
          </motion.div>

          <motion.div variants={itemVariants}>
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
          </motion.div>

          <motion.div variants={itemVariants}>
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
          </motion.div>

          <motion.div variants={itemVariants}>
            <LinkCard
              title="About"
              href="/about"
              description="Learn more about my experience, skills, and professional background."
              color="ivory"
            />
          </motion.div>
        </motion.div>

        {/* Social Links */}
        <motion.div
          className="flex flex-wrap justify-center gap-6 text-sm font-medium sm:gap-10"
          style={{ color: 'var(--color-text-muted)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
        >
          <Link
            href={addUtmParams(
              'https://github.com/duyet',
              'homepage',
              'footer_github'
            )}
            target="_blank"
            className="transition-colors duration-200 hover:text-[var(--color-accent)]"
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
            className="transition-colors duration-200 hover:text-[var(--color-accent)]"
          >
            LinkedIn
          </Link>
          <Link
            href="/ls"
            className="transition-colors duration-200 hover:text-[var(--color-accent)]"
          >
            Short URLs
          </Link>
          <a
            href="/llms.txt"
            className="transition-colors duration-200 hover:text-[var(--color-accent)]"
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
            className="transition-colors duration-200 hover:text-[var(--color-accent)]"
          >
            Status
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
