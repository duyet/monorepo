import { getAllPosts } from '@duyet/libs/getPost'
import { HeroSection } from './components/hero-section'
import { AboutSection } from './components/about-section'
import { BlogSection } from './components/blog-section'
import { InsightsSection } from './components/insights-section'
import { ContactSection } from './components/contact-section'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function HomePage() {
  // Fetch blog posts data at build time
  const allPosts = getAllPosts(['slug', 'title', 'date', 'excerpt', 'category', 'tags'])
  const latestPosts = allPosts.slice(0, 4)

  // Calculate stats for hero section
  const postCount = allPosts.length
  const yearsSinceFirst = allPosts.length > 0
    ? new Date().getFullYear() - new Date(allPosts[allPosts.length - 1].date).getFullYear()
    : 0

  return (
    <div className="min-h-screen">
      <HeroSection postCount={postCount} yearsSinceFirst={yearsSinceFirst} />
      <AboutSection />
      <BlogSection latestPosts={latestPosts} />
      <InsightsSection />
      <ContactSection />
    </div>
  )
}