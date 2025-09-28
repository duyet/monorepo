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
    <section id="contact" className="py-20 bg-gray-50 dark:bg-slate-800">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Let&apos;s Connect
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            I&apos;m always interested in discussing data engineering, Rust, or potential collaborations.
            Feel free to reach out!
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12">
          {/* Contact Methods */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Get In Touch
            </h3>
            <div className="space-y-4">
              {socialLinks.map((link, index) => (
                <Link
                  key={index}
                  href={link.href}
                  target="_blank"
                  className={`flex items-center space-x-4 p-4 rounded-lg border border-gray-200 dark:border-gray-700 transition-all ${link.color}`}
                >
                  {link.icon}
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {link.name}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {link.description}
                    </div>
                  </div>
                  <ExternalLinkIcon size={16} className="opacity-50" />
                </Link>
              ))}
            </div>

            {/* Quick Stats */}
            <div className="mt-8 p-6 bg-white dark:bg-slate-900 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Response Time
              </h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    &lt; 24h
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Email Response
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    Active
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Open Source
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Projects & Links */}
          <div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
              Explore My Work
            </h3>
            <div className="space-y-4">
              {projects.map((project, index) => (
                <Link
                  key={index}
                  href={project.url}
                  target="_blank"
                  className="block p-4 bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                        {project.name}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {project.description}
                      </div>
                    </div>
                    <ExternalLinkIcon size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>
              ))}
            </div>

            {/* Available for */}
            <div className="mt-8 p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl">
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Available For
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Technical consulting</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Speaking at conferences</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Open source collaboration</span>
                </li>
                <li className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-700 dark:text-gray-300">Mentoring opportunities</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}