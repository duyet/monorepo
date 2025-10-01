import Link from 'next/link'
import { urls } from '../config/urls'

export const dynamic = 'force-static'
export const revalidate = 3600

export default function ListPage() {
  // Filter out system URLs and format for display
  const publicUrls = Object.entries(urls)
    .filter(([_, value]) => {
      if (typeof value === 'string') return true
      return !value.system
    })
    .map(([path, value]) => ({
      path,
      target: typeof value === 'string' ? value : value.target,
      desc: typeof value === 'string' ? undefined : value.desc,
    }))

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="mx-auto max-w-4xl px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="mb-4 inline-block text-sm text-neutral-500 transition-colors hover:text-neutral-900"
          >
            ← Back to home
          </Link>
          <h1 className="mb-2 font-serif text-4xl font-normal text-neutral-900">
            All Links
          </h1>
          <p className="text-neutral-600">
            Short URLs and redirects available on duyet.net
          </p>
        </div>

        {/* URL List */}
        <div className="space-y-3">
          {publicUrls.map(({ path, target, desc }) => (
            <div
              key={path}
              className="rounded-lg border border-neutral-200 bg-white p-4 transition-colors hover:border-neutral-300"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-baseline gap-3">
                    <code className="font-mono text-sm font-medium text-neutral-900">
                      {path}
                    </code>
                    {desc && (
                      <span className="text-xs text-neutral-500">{desc}</span>
                    )}
                  </div>
                  <Link
                    href={target}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="break-all text-sm text-neutral-600 transition-colors hover:text-neutral-900"
                  >
                    → {target}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-neutral-200 pt-8 text-center text-sm text-neutral-500">
          <p>Total: {publicUrls.length} short URLs</p>
        </div>
      </div>
    </div>
  )
}
