import { ContentCard } from '@/components/content-card'
import Container from '@duyet/components/Container'
import { getAllCategories } from '@duyet/libs/getPost'
import { getSlug } from '@duyet/libs/getSlug'

// Category descriptions for better UX
const categoryDescriptions: Record<string, string> = {
  'Data Engineering': 'Building data pipelines, ETL processes, and data infrastructure at scale',
  'Machine Learning': 'Exploring AI, ML algorithms, and practical implementations',
  'Web Development': 'Modern web technologies, frameworks, and best practices',
  'Rust': 'Systems programming with Rust and exploring its ecosystem',
  'JavaScript': 'Deep dives into JavaScript, TypeScript, and Node.js',
  'Career': 'Career development, tech industry insights, and professional growth',
  'Tutorial': 'Step-by-step guides and hands-on tutorials',
  'Personal': 'Personal reflections, thoughts, and experiences',
}

// Rotating color and illustration scheme
const colorScheme: Array<{
  color: 'ivory' | 'oat' | 'cream' | 'cactus' | 'sage' | 'lavender'
  illustration: 'wavy' | 'geometric' | 'blob' | 'none'
}> = [
  { color: 'cactus', illustration: 'wavy' },
  { color: 'sage', illustration: 'geometric' },
  { color: 'lavender', illustration: 'blob' },
  { color: 'oat', illustration: 'wavy' },
  { color: 'ivory', illustration: 'geometric' },
  { color: 'cream', illustration: 'blob' },
]

export default function Categories() {
  const categories = getAllCategories()
  const categoryEntries = Object.entries(categories).sort(([, a], [, b]) => b - a)
  const totalPosts = Object.values(categories).reduce((sum, count) => sum + count, 0)

  return (
    <div className="min-h-screen">
      <Container>
        <div className="mb-12">
          <h1 className="mb-6 font-serif text-5xl font-bold text-neutral-900 md:text-6xl lg:text-7xl">
            Categories
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-neutral-700">
            Explore my writing organized by{' '}
            <strong className="font-semibold text-neutral-900">
              {categoryEntries.length} main categories
            </strong>
            , covering everything from data engineering and machine learning to web
            development and career insights. {totalPosts} posts and counting.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categoryEntries.map(([category, count], index) => {
            const { color, illustration } = colorScheme[index % colorScheme.length]
            const description = categoryDescriptions[category] ||
              `Explore ${count} ${count === 1 ? 'post' : 'posts'} about ${category.toLowerCase()}`

            return (
              <ContentCard
                key={category}
                title={category}
                href={`/category/${getSlug(category)}`}
                description={description}
                color={color}
                illustration={illustration}
                tags={[`${count} ${count === 1 ? 'post' : 'posts'}`]}
              />
            )
          })}
        </div>
      </Container>
    </div>
  )
}
