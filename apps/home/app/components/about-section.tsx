import { Building2Icon, MapPinIcon, CalendarIcon } from 'lucide-react'

export function AboutSection() {
  const technologies = [
    'ClickHouse', 'Rust', 'TypeScript', 'Spark', 'Airflow', 'K8s', 'Python', 'AWS/GCP'
  ]

  const highlights = [
    { icon: Building2Icon, text: 'Senior Data Engineer at Cartrack', subtext: 'Oct 2023 - Present' },
    { icon: MapPinIcon, text: '350TB+ data migrated, zero downtime', subtext: '100x faster queries' },
    { icon: CalendarIcon, text: '6+ years experience', subtext: '100+ blog posts' }
  ]

  return (
    <section id="about" className="py-6 px-4 bg-white border-b border-claude-gray-200">
      <div className="container mx-auto max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-4">
          {/* Left: About */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-claude-black">
              About
            </h2>
            <p className="text-sm text-claude-gray-700 leading-relaxed">
              I specialize in distributed systems and cloud infrastructure. At Cartrack, I led a 350TB+ data lake migration to ClickHouse, achieving 300% better compression and 100x faster queries. Previously at Fossil, I reduced cloud costs 55% while leading a team of 6 engineers.
            </p>
            <div className="flex flex-wrap gap-2">
              {technologies.map((tech) => (
                <span
                  key={tech}
                  className="px-2.5 py-1 bg-claude-beige text-claude-brown text-xs font-medium rounded"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Right: Highlights */}
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-claude-black">
              Highlights
            </h2>
            {highlights.map((item, index) => {
              const Icon = item.icon
              return (
                <div key={index} className="flex items-start gap-2">
                  <Icon className="text-claude-copper flex-shrink-0 mt-0.5" size={16} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-claude-gray-800">{item.text}</div>
                    <div className="text-xs text-claude-gray-600">{item.subtext}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}