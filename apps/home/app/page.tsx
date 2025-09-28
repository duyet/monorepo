import { HeroSection } from './components/hero-section'
import { AboutSection } from './components/about-section'
import { BlogSection } from './components/blog-section'
import { InsightsSection } from './components/insights-section'
import { ContactSection } from './components/contact-section'

export const dynamic = 'force-static'
export const revalidate = 3600

export default async function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <AboutSection />
      <BlogSection />
      <InsightsSection />
      <ContactSection />
    </div>
  )
}