import Link from 'next/link'

export const dynamic = 'force-static'

// SVG Icons matching home page style
const ResumeIcon = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle
      cx="40"
      cy="28"
      r="8"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <path
      d="M28 50C28 44 32 42 40 42C48 42 52 44 52 50"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <rect
      x="22"
      y="12"
      width="36"
      height="56"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
  </svg>
)

const GithubIcon = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M40 20C28.95 20 20 28.95 20 40C20 48.85 25.73 56.35 33.68 58.98C34.68 59.17 35.03 58.55 35.03 58.02C35.03 57.53 35.01 56.18 35.01 54.75C30 55.77 28.8 53.37 28.4 52.12C28.18 51.48 27.2 49.95 26.38 49.46C25.73 49.1 24.73 48.08 26.36 48.06C27.87 48.04 28.93 49.59 29.3 50.21C31.1 53.19 33.97 52.34 35.09 51.81C35.27 50.61 35.76 49.75 36.3 49.23C32.15 48.71 27.8 47.01 27.8 39.4C27.8 37.29 28.55 35.56 29.35 34.21C29.15 33.69 28.48 31.69 29.55 29C29.55 29 31.24 28.47 35.03 30.96C36.63 30.5 38.33 30.27 40.03 30.27C41.73 30.27 43.43 30.5 45.03 30.96C48.82 28.45 50.51 29 50.51 29C51.58 31.69 50.91 33.69 50.71 34.21C51.51 35.56 52.26 37.27 52.26 39.4C52.26 47.03 47.89 48.71 43.74 49.23C44.44 49.85 45.01 51.05 45.01 52.92C45.01 55.6 44.99 57.75 44.99 58.02C44.99 58.55 45.34 59.19 46.34 58.98C50.3156 57.6502 53.7015 55.0507 56.0409 51.5884C58.3803 48.1261 59.5501 44.0041 59.38 39.83C59.38 28.95 51.05 20 40 20Z"
      fill="currentColor"
    />
  </svg>
)

const LinkedInIcon = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="20"
      y="20"
      width="40"
      height="40"
      rx="4"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <circle cx="30" cy="30" r="3" fill="currentColor" />
    <rect x="26" y="36" width="8" height="18" fill="currentColor" />
    <path
      d="M40 36V54M40 36C40 33 42 32 45 32C48 32 50 33 50 36V54"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)

const BlogIcon = () => (
  <svg
    width="80"
    height="80"
    viewBox="0 0 80 80"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="20"
      y="15"
      width="40"
      height="50"
      rx="2"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
    />
    <line
      x1="28"
      y1="25"
      x2="52"
      y2="25"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="28"
      y1="33"
      x2="52"
      y2="33"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
    <line
      x1="28"
      y1="41"
      x2="45"
      y2="41"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)

interface LinkItem {
  icon: () => React.JSX.Element
  title: string
  description: string
  url: string
  color: string
}

export default function About() {
  const links: LinkItem[] = [
    {
      icon: ResumeIcon,
      title: 'Resume',
      description:
        'Experience building scalable data infrastructure and leading engineering teams.',
      url: 'https://cv.duyet.net',
      color: 'bg-orange-100/50',
    },
    {
      icon: GithubIcon,
      title: 'GitHub',
      description:
        'Open source contributions and personal projects in Python, Rust, and TypeScript.',
      url: 'https://github.com/duyet',
      color: 'bg-purple-100/50',
    },
    {
      icon: LinkedInIcon,
      title: 'LinkedIn',
      description:
        'Professional network and career highlights in data engineering.',
      url: 'https://linkedin.com/in/duyet',
      color: 'bg-blue-100/50',
    },
    {
      icon: BlogIcon,
      title: 'Blog Home',
      description:
        'Technical writings on data engineering, distributed systems, and open source.',
      url: '/',
      color: 'bg-amber-100/60',
    },
  ]

  const skills = [
    {
      name: 'Python',
      link: 'https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=python',
    },
    {
      name: 'Rust',
      link: 'https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=rust',
    },
    {
      name: 'Javascript',
      link: 'https://github.com/duyet?utf8=%E2%9C%93&tab=repositories&q=&type=public&language=javascript',
    },
    { name: 'Spark' },
    { name: 'Airflow', link: 'https://blog.duyet.net/tag/airflow/' },
    { name: 'AWS' },
    { name: 'GCP' },
  ]

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-6 font-serif text-5xl font-normal text-neutral-900 sm:text-6xl">
            About
          </h1>
          <p className="mx-auto max-w-3xl text-lg leading-relaxed text-neutral-700">
            <strong className="font-semibold text-neutral-900">
              Data Engineer
            </strong>{' '}
            with 6+ years of experience. I am confident in my knowledge of Data
            Engineering concepts, best practices and state-of-the-art data and
            Cloud technologies.
          </p>
        </div>

        {/* Links Grid */}
        <div className="mb-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {links.map((link, index) => {
            const Icon = link.icon
            return (
              <Link
                key={index}
                href={link.url}
                target={link.url.startsWith('http') ? '_blank' : undefined}
                rel={
                  link.url.startsWith('http')
                    ? 'noopener noreferrer'
                    : undefined
                }
                className={`group flex flex-col p-10 ${link.color} rounded-3xl transition-transform duration-200 hover:scale-[1.02]`}
              >
                <div className="mb-8 text-neutral-800">
                  <Icon />
                </div>
                <h3 className="mb-3 text-xl font-medium text-neutral-900">
                  {link.title}
                </h3>
                <p className="text-sm leading-relaxed text-neutral-700">
                  {link.description}
                </p>
              </Link>
            )
          })}
        </div>

        {/* Skills Section */}
        <div className="rounded-3xl bg-stone-100/70 p-8 sm:p-12">
          <h2 className="mb-6 font-serif text-3xl font-normal text-neutral-900">
            Skills & Stacks
          </h2>
          <div className="flex flex-wrap gap-3">
            {skills.map(({ name, link }) => (
              <span
                key={name}
                className="inline-block rounded-full bg-neutral-50 px-5 py-2 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-100"
              >
                {link ? (
                  <Link
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-neutral-900"
                  >
                    {name}
                  </Link>
                ) : (
                  name
                )}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
