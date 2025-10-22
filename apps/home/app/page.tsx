import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = 3600

// SVG Icons - Refined and modern design
const BlogIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-transform duration-300 ease-out"
  >
    {/* Document with folded corner */}
    <path
      d="M16 8C16 6.89543 16.8954 6 18 6H38L48 16V54C48 55.1046 47.1046 56 46 56H18C16.8954 56 16 55.1046 16 54V8Z"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    <path
      d="M38 6V14C38 15.1046 38.8954 16 40 16H48"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Text lines with varying lengths */}
    <line
      x1="24"
      y1="26"
      x2="40"
      y2="26"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="24"
      y1="34"
      x2="40"
      y2="34"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="24"
      y1="42"
      x2="34"
      y2="42"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
)

const ResumeIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-transform duration-300 ease-out"
  >
    {/* Document outline */}
    <rect
      x="18"
      y="8"
      width="28"
      height="48"
      rx="3"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Profile circle */}
    <circle
      cx="32"
      cy="20"
      r="5"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    {/* Shoulders/body */}
    <path
      d="M24 34C24 30.6863 27 28 32 28C37 28 40 30.6863 40 34"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    {/* Info lines */}
    <line
      x1="24"
      y1="42"
      x2="40"
      y2="42"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
    <line
      x1="24"
      y1="48"
      x2="36"
      y2="48"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
    />
  </svg>
)

const InsightsIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-transform duration-300 ease-out"
  >
    {/* Bar chart with varying heights */}
    <rect
      x="12"
      y="36"
      width="8"
      height="20"
      rx="2"
      fill="currentColor"
      opacity="0.7"
    />
    <rect
      x="24"
      y="24"
      width="8"
      height="32"
      rx="2"
      fill="currentColor"
      opacity="0.85"
    />
    <rect
      x="36"
      y="16"
      width="8"
      height="40"
      rx="2"
      fill="currentColor"
    />
    <rect
      x="48"
      y="28"
      width="8"
      height="28"
      rx="2"
      fill="currentColor"
      opacity="0.8"
    />
    {/* Trend line */}
    <path
      d="M16 40L28 28L40 20L52 32"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      opacity="0.6"
    />
    <circle cx="16" cy="40" r="2.5" fill="currentColor" opacity="0.6" />
    <circle cx="28" cy="28" r="2.5" fill="currentColor" opacity="0.6" />
    <circle cx="40" cy="20" r="2.5" fill="currentColor" opacity="0.6" />
    <circle cx="52" cy="32" r="2.5" fill="currentColor" opacity="0.6" />
  </svg>
)

const PhotosIcon = () => (
  <svg
    width="64"
    height="64"
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="transition-transform duration-300 ease-out"
  >
    {/* Camera body */}
    <rect
      x="12"
      y="20"
      width="40"
      height="32"
      rx="4"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Lens */}
    <circle
      cx="32"
      cy="36"
      r="8"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    <circle
      cx="32"
      cy="36"
      r="4"
      stroke="currentColor"
      strokeWidth="2.5"
      fill="none"
    />
    {/* Top viewfinder */}
    <rect
      x="24"
      y="12"
      width="16"
      height="8"
      rx="2"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
    {/* Flash indicator */}
    <circle cx="44" cy="26" r="1.5" fill="currentColor" />
  </svg>
)

export default function HomePage() {
  const links = [
    {
      icon: BlogIcon,
      title: 'Blog',
      description:
        'Technical writings on data engineering, distributed systems, and open source.',
      url: process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net',
      color: 'bg-yellow-100',
      iconColor: 'text-yellow-800',
    },
    {
      icon: ResumeIcon,
      title: 'Resume',
      description:
        'Experience building scalable data infrastructure and leading engineering teams.',
      url: process.env.NEXT_PUBLIC_DUYET_CV_URL || 'https://cv.duyet.net',
      color: 'bg-orange-100',
      iconColor: 'text-orange-800',
    },
    {
      icon: InsightsIcon,
      title: 'Insights',
      description:
        'Analytics dashboard showcasing data from GitHub, WakaTime, and more.',
      url:
        process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL ||
        'https://insights.duyet.net',
      color: 'bg-sky-100',
      iconColor: 'text-sky-800',
    },
    {
      icon: PhotosIcon,
      title: 'Photos',
      description:
        'Photography portfolio and visual stories from travels and daily life.',
      url:
        process.env.NEXT_PUBLIC_DUYET_PHOTOS_URL || 'https://photos.duyet.net',
      color: 'bg-purple-100',
      iconColor: 'text-purple-800',
    },
  ]

  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24 md:py-32">
        {/* Header */}
        <div className="mb-24 text-center">
          <h1 className="mb-5 font-serif text-6xl font-normal tracking-tight text-claude-black sm:text-7xl md:text-8xl">
            Duyet
          </h1>
          <p className="text-lg font-light tracking-wide text-claude-gray-600 sm:text-xl">
            Data Engineering
          </p>
        </div>

        {/* Links Grid */}
        <div className="mb-24 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {links.map((link, index) => {
            const Icon = link.icon
            return (
              <Link
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col p-8 ${link.color} rounded-2xl transition-all duration-300`}
              >
                <div className={`mb-6 ${link.iconColor}`}>
                  <Icon />
                </div>
                <h3 className="mb-3 text-xl font-semibold tracking-tight text-claude-black">
                  {link.title}
                </h3>
                <p className="text-sm font-light leading-relaxed text-claude-gray-700">
                  {link.description}
                </p>
              </Link>
            )
          })}
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-10 text-sm font-medium text-claude-gray-500">
          <Link
            href="https://github.com/duyet"
            target="_blank"
            className="transition-colors duration-200 hover:text-claude-black"
          >
            GitHub
          </Link>
          <Link
            href="https://linkedin.com/in/duyet"
            target="_blank"
            className="transition-colors duration-200 hover:text-claude-black"
          >
            LinkedIn
          </Link>
          <Link
            href="/llms.txt"
            className="transition-colors duration-200 hover:text-claude-black"
          >
            llms.txt
          </Link>
        </div>
      </div>
    </div>
  )
}
