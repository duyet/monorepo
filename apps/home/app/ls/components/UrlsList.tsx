'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'

type UrlEntry = {
  path: string
  target: string
  desc?: string
}

export default function UrlsList({ urls }: { urls: UrlEntry[] }) {
  const [searchQuery, setSearchQuery] = useState('')

  // Filter based on search query
  const filteredUrls = useMemo(() => {
    if (!searchQuery) return urls

    const query = searchQuery.toLowerCase()
    return urls.filter(
      ({ path, target, desc }) =>
        path.toLowerCase().includes(query) ||
        target.toLowerCase().includes(query) ||
        desc?.toLowerCase().includes(query)
    )
  }, [searchQuery, urls])

  return (
    <>
      {/* Search Bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by path, URL, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-neutral-300 bg-white px-5 py-4 pl-12 text-neutral-900 placeholder-neutral-500 shadow-sm transition-all focus:border-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200"
          />
          <svg
            className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 transition-colors hover:text-neutral-900"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          )}
        </div>
        <div className="mt-3 flex items-center justify-between text-sm">
          <p className="text-neutral-500">
            {filteredUrls.length === urls.length ? (
              <>Showing all {urls.length} short URLs</>
            ) : (
              <>
                Showing {filteredUrls.length} of {urls.length} URLs
              </>
            )}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-neutral-600 hover:text-neutral-900"
            >
              Clear search
            </button>
          )}
        </div>
      </div>

      {/* URL Grid */}
      {filteredUrls.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {filteredUrls.map(({ path, target, desc }) => {
            const isExternal = target.startsWith('http')

            return (
              <Link
                key={path}
                href={target}
                target={isExternal ? '_blank' : undefined}
                rel={isExternal ? 'noopener noreferrer' : undefined}
                className="group relative overflow-hidden rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition-all hover:border-neutral-300 hover:shadow-md"
              >
                <div className="flex flex-col gap-2">
                  {/* Path */}
                  <div className="flex items-center gap-2">
                    <code className="inline-flex items-center rounded-lg bg-neutral-100 px-3 py-1.5 font-mono text-sm font-semibold text-neutral-900 transition-colors group-hover:bg-neutral-200">
                      {path}
                    </code>
                    {isExternal && (
                      <svg
                        className="h-4 w-4 text-neutral-400 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                        />
                      </svg>
                    )}
                  </div>

                  {/* Description */}
                  {desc && <p className="text-sm text-neutral-700">{desc}</p>}

                  {/* Target URL */}
                  <div className="mt-1 flex items-center gap-2 text-xs text-neutral-500">
                    <svg
                      className="h-3 w-3 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                    <span className="truncate font-mono">{target}</span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-neutral-200 bg-white p-12 text-center">
          <svg
            className="mx-auto mb-4 h-12 w-12 text-neutral-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <p className="text-neutral-600">
            No URLs found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-3 text-sm text-neutral-900 hover:underline"
          >
            Clear search
          </button>
        </div>
      )}
    </>
  )
}
