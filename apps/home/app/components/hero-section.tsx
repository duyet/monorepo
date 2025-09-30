import Link from 'next/link'
import { ArrowRightIcon, GithubIcon, LinkedinIcon, MailIcon } from 'lucide-react'

interface HeroSectionProps {
  postCount: number
  yearsSinceFirst: number
}

export function HeroSection({ postCount, yearsSinceFirst }: HeroSectionProps) {
  const stats = [
    { value: postCount, label: 'Blog Posts', color: 'text-claude-copper' },
    { value: `${yearsSinceFirst}+`, label: 'Years', color: 'text-claude-brown' },
    { value: '350TB+', label: 'Data', color: 'text-claude-orange' },
    { value: '100x', label: 'Speed', color: 'text-claude-copper' }
  ]

  return (
    <section className="py-8 px-4 bg-claude-beige border-b border-claude-tan">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left: Profile & Intro */}
          <div className="flex-1 space-y-3">
            <div className="flex items-start gap-4">
              {/* Profile Image */}
              <div className="w-16 h-16 rounded-full bg-claude-brown flex-shrink-0 flex items-center justify-center text-xl font-semibold text-claude-cream">
                D
              </div>

              <div className="flex-1 min-w-0">
                {/* Name and Title */}
                <h1 className="text-3xl font-semibold text-claude-black mb-0.5">
                  Duyet Le
                </h1>
                <h2 className="text-base text-claude-gray-600 mb-2">
                  Senior Data Engineer
                </h2>

                {/* Bio */}
                <p className="text-sm text-claude-gray-700 leading-relaxed mb-3">
                  Data Engineer with 6+ years building scalable infrastructure with ClickHouse, Rust, and TypeScript.
                </p>

                {/* Social Links */}
                <div className="flex flex-wrap gap-3 text-sm">
                  <Link
                    href="https://github.com/duyet"
                    target="_blank"
                    className="flex items-center gap-1 text-claude-gray-700 hover:text-claude-black transition-colors"
                  >
                    <GithubIcon size={16} />
                    <span>GitHub</span>
                  </Link>
                  <Link
                    href="https://linkedin.com/in/duyet"
                    target="_blank"
                    className="flex items-center gap-1 text-claude-gray-700 hover:text-claude-black transition-colors"
                  >
                    <LinkedinIcon size={16} />
                    <span>LinkedIn</span>
                  </Link>
                  <Link
                    href="mailto:me@duyet.net"
                    className="flex items-center gap-1 text-claude-gray-700 hover:text-claude-black transition-colors"
                  >
                    <MailIcon size={16} />
                    <span>Email</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-claude-tan">
              <div className="grid grid-cols-4 lg:grid-cols-2 gap-3">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-xl font-semibold ${stat.color}`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-claude-gray-600 leading-tight">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}