import Link from 'next/link'
import BlogIcon from './components/icons/BlogIcon'
import ResumeIcon from './components/icons/ResumeIcon'
import InsightsIcon from './components/icons/InsightsIcon'
import PhotosIcon from './components/icons/PhotosIcon'
import AboutIcon from './components/icons/AboutIcon'

export const dynamic = 'force-static'
export const revalidate = 3600

export default function HomePage() {
  const links = [
    {
      icon: BlogIcon,
      title: 'Blog',
      description:
        'Technical writings on data engineering, distributed systems, and open source.',
      url: process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net',
      color: 'bg-[#de6e4b]',
      iconColor: 'text-neutral-900',
    },
    {
      icon: ResumeIcon,
      title: 'Resume',
      description:
        'Experience building scalable data infrastructure and leading engineering teams.',
      url: process.env.NEXT_PUBLIC_DUYET_CV_URL || 'https://cv.duyet.net',
      color: 'bg-[#f0d9a8]',
      iconColor: 'text-neutral-900',
    },
    {
      icon: InsightsIcon,
      title: 'Insights',
      description:
        'Analytics dashboard showcasing data from GitHub, WakaTime, and more.',
      url:
        process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL ||
        'https://insights.duyet.net',
      color: 'bg-[#a8d5ba]',
      iconColor: 'text-neutral-900',
    },
    {
      icon: PhotosIcon,
      title: 'Photos',
      description:
        'Photography portfolio and visual stories from travels and daily life.',
      url:
        process.env.NEXT_PUBLIC_DUYET_PHOTOS_URL || 'https://photos.duyet.net',
      color: 'bg-white',
      iconColor: 'text-neutral-900',
    },
    {
      icon: AboutIcon,
      title: 'About',
      description:
        'Learn more about my experience, skills, and professional background.',
      url: '/about',
      color: 'bg-[#e8e8e8]',
      iconColor: 'text-neutral-900',
    },
  ]

  return (
    <div className="flex min-h-screen items-center bg-neutral-50">
      <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 sm:mb-12 text-center">
          <h1 className="mb-4 font-serif text-5xl font-normal text-neutral-900 sm:text-6xl">
            Duyet
          </h1>
          <p className="text-base leading-relaxed text-neutral-700 sm:text-lg">
            Data Engineering
          </p>
        </div>

        {/* Links Grid - Claude Style */}
        <div className="mb-8 sm:mb-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Blog - Featured Large Card */}
          <Link
            href={links[0].url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col p-6 ${links[0].color} rounded-3xl sm:col-span-2 lg:col-span-2`}
          >
            <div className={`mb-4 ${links[0].iconColor}`}>
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
            className={`group flex flex-col p-6 ${links[1].color} rounded-3xl`}
          >
            <div className={`mb-4 ${links[1].iconColor}`}>
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
            className={`group flex flex-col p-6 ${links[2].color} rounded-3xl`}
          >
            <div className={`mb-4 ${links[2].iconColor}`}>
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

          {/* Photos */}
          <Link
            href={links[3].url}
            target="_blank"
            rel="noopener noreferrer"
            className={`group flex flex-col p-6 ${links[3].color} rounded-3xl`}
          >
            <div className={`mb-4 ${links[3].iconColor}`}>
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

          {/* About */}
          <Link
            href={links[4].url}
            rel="noopener noreferrer"
            className={`group flex flex-col p-6 ${links[4].color} rounded-3xl`}
          >
            <div className={`mb-4 ${links[4].iconColor}`}>
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
          </Link>
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-10 text-sm font-medium text-neutral-600">
          <Link
            href="https://github.com/duyet"
            target="_blank"
            className="transition-colors duration-200 hover:text-neutral-900"
          >
            GitHub
          </Link>
          <Link
            href="https://linkedin.com/in/duyet"
            target="_blank"
            className="transition-colors duration-200 hover:text-neutral-900"
          >
            LinkedIn
          </Link>
          <Link
            href="/llms.txt"
            className="transition-colors duration-200 hover:text-neutral-900"
          >
            llms.txt
          </Link>
        </div>
      </div>
    </div>
  )
}
