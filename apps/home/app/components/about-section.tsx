import { Building2Icon, MapPinIcon, CalendarIcon } from 'lucide-react'

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-white dark:bg-slate-900">
      <div className="container mx-auto px-6 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            About Me
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Passionate about building scalable data infrastructure and empowering teams with data-driven insights
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Bio Text */}
          <div className="space-y-6">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              I&apos;m a Senior Data Engineer with over 6 years of experience building modern data platforms
              that handle massive scale. I specialize in distributed systems, cloud computing, and
              creating data infrastructure that teams love to use.
            </p>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              Currently at <strong>Cartrack</strong>, I led the migration of a 350TB+ data lake from
              Iceberg to ClickHouse, achieving 300% better compression and 2x-100x faster queries.
              Previously at <strong>Fossil Group</strong>, I optimized cloud costs from $45K to $20K
              monthly while managing a team of 6 engineers and analysts.
            </p>

            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              I&apos;m passionate about <strong>Rust</strong> for systems programming and have designed
              next-generation data platforms using modern technologies. I believe in sharing knowledge
              through blogging and contributing to open source.
            </p>

            {/* Current Status */}
            <div className="flex items-center space-x-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <Building2Icon className="text-blue-600 dark:text-blue-400" size={20} />
              <div>
                <div className="font-medium text-gray-900 dark:text-white">
                  Senior Data Engineer at Cartrack
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Oct 2023 - Present
                </div>
              </div>
            </div>
          </div>

          {/* Skills & Technologies */}
          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Technologies I Love
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: 'ClickHouse', color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
                  { name: 'Rust', color: 'text-orange-600 bg-orange-50 dark:bg-orange-900/20' },
                  { name: 'TypeScript', color: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20' },
                  { name: 'Apache Spark', color: 'text-red-600 bg-red-50 dark:bg-red-900/20' },
                  { name: 'Airflow', color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
                  { name: 'Kubernetes', color: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' },
                  { name: 'Python', color: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20' },
                  { name: 'AWS/GCP', color: 'text-gray-600 bg-gray-50 dark:bg-gray-900/20' }
                ].map((tech) => (
                  <div
                    key={tech.name}
                    className={`px-3 py-2 rounded-lg text-sm font-medium ${tech.color}`}
                  >
                    {tech.name}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Key Achievements
              </h3>
              <ul className="space-y-3">
                {[
                  'Migrated 350TB+ data lake with zero downtime',
                  'Achieved 100x query performance improvements',
                  'Reduced infrastructure costs by 55%',
                  'Led teams of 6+ engineers and analysts',
                  'Built production systems in Rust',
                  'Published 100+ technical blog posts'
                ].map((achievement, index) => (
                  <li key={index} className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-gray-700 dark:text-gray-300">{achievement}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}