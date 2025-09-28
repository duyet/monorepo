import { Building2Icon, MapPinIcon, CalendarIcon } from 'lucide-react'

export function AboutSection() {
  const technologies = [
    { name: 'ClickHouse', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
    { name: 'Rust', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
    { name: 'TypeScript', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
    { name: 'Apache Spark', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
    { name: 'Airflow', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
    { name: 'Kubernetes', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
    { name: 'Python', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
    { name: 'AWS/GCP', color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20' }
  ]

  const achievements = [
    'Migrated 350TB+ data lake with zero downtime',
    'Achieved 100x query performance improvements',
    'Reduced infrastructure costs by 55%',
    'Led teams of 6+ engineers and analysts',
    'Built production systems in Rust',
    'Published 100+ technical blog posts'
  ]

  return (
    <section id="about" className="py-12 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            About Me
          </h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Passionate about building scalable data infrastructure and empowering teams with data-driven insights
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bio Card */}
          <div className="lg:col-span-2 bg-gray-50 dark:bg-slate-800 rounded-xl p-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3 mb-4">
                <Building2Icon className="text-blue-600 dark:text-blue-400" size={20} />
                <div>
                  <div className="font-medium text-gray-900 dark:text-white text-sm">
                    Senior Data Engineer at Cartrack
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Oct 2023 - Present
                  </div>
                </div>
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                Senior Data Engineer with 6+ years building modern data platforms at massive scale.
                I specialize in distributed systems, cloud computing, and creating infrastructure teams love.
              </p>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                At <strong>Cartrack</strong>, I led the migration of a 350TB+ data lake from Iceberg to ClickHouse,
                achieving 300% better compression and 2x-100x faster queries. Previously at <strong>Fossil Group</strong>,
                I optimized cloud costs from $45K to $20K monthly while managing a team of 6 engineers.
              </p>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-sm">
                Passionate about <strong>Rust</strong> for systems programming and designing next-generation
                data platforms. I believe in sharing knowledge through blogging and open source.
              </p>
            </div>
          </div>

          {/* Achievements Card */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Key Achievements
            </h3>
            <ul className="space-y-2">
              {achievements.map((achievement, index) => (
                <li key={index} className="flex items-start space-x-2">
                  <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                  <span className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{achievement}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Technologies Section - Compact */}
        <div className="mt-6">
          <div className="bg-gray-50 dark:bg-slate-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 text-center">
              Technologies I Love
            </h3>
            <div className="flex flex-wrap justify-center gap-2">
              {technologies.map((tech) => (
                <div
                  key={tech.name}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${tech.color}`}
                >
                  {tech.name}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}