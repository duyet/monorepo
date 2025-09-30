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
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="mb-12">
          <Link href="/" className="inline-block mb-4 text-sm text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Back to home
          </Link>
          <h1 className="text-4xl font-serif font-normal text-neutral-900 mb-2">
            All Links
          </h1>
          <p className="text-neutral-600">Short URLs and redirects available on duyet.net</p>
        </div>

        {/* URL List */}
        <div className="space-y-3">
          {publicUrls.map(({ path, target, desc }) => (
            <div
              key={path}
              className="bg-white border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-3 mb-1">
                    <code className="text-sm font-mono text-neutral-900 font-medium">
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
                    className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors break-all"
                  >
                    → {target}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-neutral-200 text-center text-sm text-neutral-500">
          <p>Total: {publicUrls.length} short URLs</p>
        </div>
      </div>
    </div>
  )
}