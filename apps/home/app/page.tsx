import Link from 'next/link'

export const dynamic = 'force-static'
export const revalidate = 3600

// SVG Icons
const BlogIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="15" width="40" height="50" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
    <line x1="28" y1="25" x2="52" y2="25" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="28" y1="33" x2="52" y2="33" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <line x1="28" y1="41" x2="45" y2="41" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
  </svg>
)

const ResumeIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="28" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M28 50C28 44 32 42 40 42C48 42 52 44 52 50" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <rect x="22" y="12" width="36" height="56" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
  </svg>
)

const InsightsIcon = () => (
  <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="6" fill="currentColor"/>
    <circle cx="28" cy="52" r="4" fill="currentColor"/>
    <circle cx="52" cy="28" r="4" fill="currentColor"/>
    <circle cx="28" cy="28" r="4" fill="currentColor"/>
    <circle cx="52" cy="52" r="4" fill="currentColor"/>
    <circle cx="40" cy="20" r="4" fill="currentColor"/>
    <circle cx="60" cy="40" r="4" fill="currentColor"/>
    <line x1="40" y1="34" x2="40" y2="24" stroke="currentColor" strokeWidth="2"/>
    <line x1="46" y1="40" x2="56" y2="40" stroke="currentColor" strokeWidth="2"/>
    <line x1="44" y1="44" x2="49" y2="49" stroke="currentColor" strokeWidth="2"/>
    <line x1="36" y1="44" x2="31" y2="49" stroke="currentColor" strokeWidth="2"/>
    <line x1="36" y1="36" x2="31" y2="31" stroke="currentColor" strokeWidth="2"/>
    <line x1="44" y1="36" x2="49" y2="31" stroke="currentColor" strokeWidth="2"/>
  </svg>
)

export default function HomePage() {
  const links = [
    {
      icon: BlogIcon,
      title: 'Blog',
      description: 'Technical writings on data engineering, distributed systems, and open source.',
      url: process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net',
      color: 'bg-amber-100/60',
    },
    {
      icon: ResumeIcon,
      title: 'Resume',
      description: 'Experience building scalable data infrastructure and leading engineering teams.',
      url: process.env.NEXT_PUBLIC_DUYET_CV_URL || 'https://cv.duyet.net',
      color: 'bg-orange-100/50',
    },
    {
      icon: InsightsIcon,
      title: 'Insights',
      description: 'Analytics dashboard showcasing data from GitHub, WakaTime, and more.',
      url: process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL || 'https://insights.duyet.net',
      color: 'bg-stone-100/70',
    },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-6xl mx-auto px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl sm:text-6xl font-serif font-normal text-neutral-900 mb-4">
            Duyet
          </h1>
          <p className="text-lg text-neutral-600">Data Engineering</p>
        </div>

        {/* Links Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {links.map((link, index) => {
            const Icon = link.icon
            return (
              <Link
                key={index}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex flex-col p-10 ${link.color} rounded-3xl hover:scale-[1.02] transition-transform duration-200`}
              >
                <div className="mb-8 text-neutral-800">
                  <Icon />
                </div>
                <h3 className="text-xl font-medium text-neutral-900 mb-3">
                  {link.title}
                </h3>
                <p className="text-sm text-neutral-700 leading-relaxed">
                  {link.description}
                </p>
              </Link>
            )
          })}
        </div>

        {/* Social Links */}
        <div className="flex justify-center gap-8 text-sm text-neutral-500">
          <Link href="https://github.com/duyet" target="_blank" className="hover:text-neutral-900 transition-colors">
            GitHub
          </Link>
          <Link href="https://linkedin.com/in/duyet" target="_blank" className="hover:text-neutral-900 transition-colors">
            LinkedIn
          </Link>
          <Link href="/llms.txt" className="hover:text-neutral-900 transition-colors">
            llms.txt
          </Link>
        </div>
      </div>
    </div>
  )
}