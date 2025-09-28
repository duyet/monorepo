import Link from 'next/link'
import { ArrowRightIcon, GithubIcon, LinkedinIcon, MailIcon } from 'lucide-react'

import { getAllPosts } from '@duyet/libs/getPost'

export function HeroSection() {
  // Get stats for display
  const allPosts = getAllPosts(['date'])
  const postCount = allPosts.length
  const yearsSinceFirst = allPosts.length > 0
    ? new Date().getFullYear() - new Date(allPosts[allPosts.length - 1].date).getFullYear()
    : 0

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        {/* Profile Image */}
        <div className="mb-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-1">
            <div className="w-full h-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-4xl font-bold text-gray-800 dark:text-white">
              D
            </div>
          </div>
        </div>

        {/* Name and Title */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-4">
          Duyet Le
        </h1>
        <h2 className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-6">
          Senior Data Engineer
        </h2>

        {/* Bio */}
        <p className="text-lg text-gray-700 dark:text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed">
          Data Engineer with <strong>6+ years</strong> of experience in modern data warehousing,
          distributed systems, and cloud computing. I build data infrastructure with
          <span className="text-blue-600 dark:text-blue-400 font-medium"> ClickHouse</span>,
          <span className="text-orange-600 dark:text-orange-400 font-medium"> Rust</span>, and
          <span className="text-blue-500 dark:text-blue-300 font-medium"> TypeScript</span>.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10 max-w-2xl mx-auto">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {postCount}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Blog Posts
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 dark:text-green-400">
              {yearsSinceFirst}+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Years Blogging
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              350TB+
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Data Migrated
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
              100x
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Query Speed Up
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="flex justify-center space-x-6 mb-10">
          <Link
            href="https://github.com/duyet"
            target="_blank"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            <GithubIcon size={20} />
            <span className="hidden sm:inline">GitHub</span>
          </Link>
          <Link
            href="https://linkedin.com/in/duyet"
            target="_blank"
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
          >
            <LinkedinIcon size={20} />
            <span className="hidden sm:inline">LinkedIn</span>
          </Link>
          <Link
            href="mailto:me@duyet.net"
            className="flex items-center space-x-2 text-gray-600 hover:text-green-600 dark:text-gray-400 dark:hover:text-green-400 transition-colors"
          >
            <MailIcon size={20} />
            <span className="hidden sm:inline">Email</span>
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link
            href="#blog"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Read My Blog
            <ArrowRightIcon size={16} className="ml-2" />
          </Link>
          <Link
            href="#contact"
            className="inline-flex items-center px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Get In Touch
          </Link>
        </div>
      </div>
    </section>
  )
}