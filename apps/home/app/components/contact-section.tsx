import Link from 'next/link'
import { MailIcon, GithubIcon, LinkedinIcon, TwitterIcon, ExternalLinkIcon } from 'lucide-react'

export function ContactSection() {
  const socialLinks = [
    {
      name: 'Email',
      href: 'mailto:me@duyet.net',
      icon: <MailIcon size={20} />,
      color: 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20',
      description: 'Let&apos;s discuss data engineering'
    },
    {
      name: 'GitHub',
      href: 'https://github.com/duyet',
      icon: <GithubIcon size={20} />,
      color: 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-900/20',
      description: 'Check out my open source work'
    },
    {
      name: 'LinkedIn',
      href: 'https://linkedin.com/in/duyet',
      icon: <LinkedinIcon size={20} />,
      color: 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20',
      description: 'Professional network'
    }
  ]

  const projects = [
    {
      name: 'Blog',
      url: process.env.NEXT_PUBLIC_DUYET_BLOG_URL || 'https://blog.duyet.net',
      description: 'Technical blog about data engineering'
    },
    {
      name: 'CV',
      url: process.env.NEXT_PUBLIC_DUYET_CV_URL || 'https://cv.duyet.net',
      description: 'Interactive resume and portfolio'
    },
    {
      name: 'Insights',
      url: process.env.NEXT_PUBLIC_DUYET_INSIGHTS_URL || 'https://insights.duyet.net',
      description: 'Analytics dashboard'
    }
  ]

  return (
    <section id="contact" className="py-6 px-4 bg-claude-beige">
      <div className="container mx-auto max-w-6xl">
        <h2 className="text-xl font-semibold text-claude-black mb-4">
          Connect
        </h2>

        <div className="grid lg:grid-cols-3 gap-3">
          {/* Contact Links */}
          {socialLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-claude-tan hover:border-claude-copper transition-colors"
            >
              <span className="text-claude-copper">{link.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-claude-gray-800">
                  {link.name}
                </div>
                <div className="text-xs text-claude-gray-600">
                  {link.description}
                </div>
              </div>
            </Link>
          ))}

          {/* Projects */}
          {projects.map((project, index) => (
            <Link
              key={index}
              href={project.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-3 bg-white/70 backdrop-blur-sm rounded-lg border border-claude-tan hover:border-claude-copper transition-colors group"
            >
              <ExternalLinkIcon size={16} className="text-claude-copper" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-claude-gray-800 group-hover:text-claude-copper transition-colors">
                  {project.name}
                </div>
                <div className="text-xs text-claude-gray-600">
                  {project.description}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}