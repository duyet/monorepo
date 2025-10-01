import Link from 'next/link'

export const dynamic = 'force-static'

export default function RobotsPage() {
  const siteUrl = 'https://blog.duyet.net'

  const robotsContent = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Sitemap: ${siteUrl}/sitemap`

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="mb-8 text-3xl font-bold">Robots.txt</h1>

      <div className="mb-8 rounded-lg bg-gray-100 p-6">
        <pre className="whitespace-pre-wrap font-mono text-sm">
          {robotsContent}
        </pre>
      </div>

      <div className="prose max-w-none">
        <h2>What is robots.txt?</h2>
        <p>
          The robots.txt file tells web crawlers which pages or files the
          crawler can or can't request from your site. This is used mainly to
          avoid overloading your site with requests.
        </p>

        <h2>Our Configuration</h2>
        <ul>
          <li>
            <strong>User-agent: *</strong> - Applies to all web crawlers
          </li>
          <li>
            <strong>Allow: /</strong> - Allows crawling of all pages
          </li>
          <li>
            <strong>Sitemap</strong> - Links to our XML and HTML sitemaps
          </li>
        </ul>

        <div className="mt-8 border-t pt-4 text-sm text-gray-500">
          <p>
            This robots.txt is also available in text format at{' '}
            <Link href="/robots.txt" className="underline">
              /robots.txt
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
