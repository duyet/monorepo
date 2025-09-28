import Link from 'next/link'
import { ArrowRightIcon, GithubIcon, LinkedinIcon, MailIcon } from 'lucide-react'

interface HeroSectionProps {
  postCount: number
  yearsSinceFirst: number
}

export function HeroSection({ postCount, yearsSinceFirst }: HeroSectionProps) {
  const stats = [
    { value: postCount, label: 'Blog Posts', color: 'text-blue-600 dark:text-blue-400' },
    { value: `${yearsSinceFirst}+`, label: 'Years Blogging', color: 'text-green-600 dark:text-green-400' },
    { value: '350TB+', label: 'Data Migrated', color: 'text-purple-600 dark:text-purple-400' },
    { value: '100x', label: 'Query Speed Up', color: 'text-orange-600 dark:text-orange-400' }
  ]

  return (
    <section className="relative min-h-[75vh] flex items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 max-w-5xl">
        <div className="grid lg:grid-cols-3 gap-8 items-center">
          {/* Left: Profile & Intro */}
          <div className="lg:col-span-2 text-center lg:text-left">
            {/* Profile Image - Compact */}
            <div className="mb-6 lg:hidden">
              <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-2xl font-bold text-gray-800 dark:text-white">
                  D
                </div>
              </div>
            </div>

            {/* Desktop Profile Image */}
            <div className="hidden lg:block float-left mr-6 mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
                <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-xl font-bold text-gray-800 dark:text-white">
                  D
                </div>
              </div>
            </div>

            {/* Name and Title */}
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-2">
              Duyet Le
            </h1>
            <h2 className="text-lg md:text-xl text-gray-600 dark:text-gray-300 mb-4">
              Senior Data Engineer
            </h2>

            {/* Bio - More compact */}
            <p className="text-base text-gray-700 dark:text-gray-400 leading-relaxed mb-6">
              Data Engineer with <strong>6+ years</strong> of experience building scalable infrastructure.
              I work with{' '}
              <span className="text-blue-600 dark:text-blue-400 font-medium">ClickHouse</span>,{' '}
              <span className="text-orange-600 dark:text-orange-400 font-medium">Rust</span>, and{' '}
              <span className="text-blue-500 dark:text-blue-300 font-medium">TypeScript</span>.
            </p>

            {/* Compact Social Links */}
            <div className="flex justify-center lg:justify-start space-x-4 mb-6">
              <Link
                href="https://github.com/duyet"
                target="_blank"
                className="flex items-center space-x-1 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors text-sm"
              >
                <GithubIcon size={18} />
                <span>GitHub</span>
              </Link>
              <Link
                href="https://linkedin.com/in/duyet"
                target="_blank"
                className="flex items-center space-x-1 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors text-sm"
              >
                <LinkedinIcon size={18} />
                <span>LinkedIn</span>
              </Link>
              <Link
                href="mailto:me@duyet.net"
                className="flex items-center space-x-1 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors text-sm"
              >
                <MailIcon size={18} />
                <span>Email</span>
              </Link>
            </div>

            {/* CTA Buttons - Compact */}
            <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-3 sm:space-y-0 sm:space-x-3">
              <Link
                href="#blog"
                className="inline-flex items-center px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors text-sm"
              >
                Read My Blog
                <ArrowRightIcon size={14} className="ml-2" />
              </Link>
              <Link
                href="#contact"
                className="inline-flex items-center px-5 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm"
              >
                Get In Touch
              </Link>
            </div>
          </div>

          {/* Right: Stats Card */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
                Key Metrics
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400 leading-tight">
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