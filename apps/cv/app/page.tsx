/* eslint react/jsx-sort-props: 0 -- No sort props */
import { FileTextIcon, GithubIcon, LinkedinIcon } from 'lucide-react'
import Link from 'next/link'

import { Education } from '@/components/education'
import { ExperienceItem } from '@/components/experience'
import { InlineLink } from '@/components/inline-link'
import { Overview } from '@/components/overview'
import { Section } from '@/components/section'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Separator } from '@/components/ui/separator'

export default function Component() {
  return (
    <div className="m-auto flex min-h-screen flex-col gap-8 text-sm text-black">
      <header className="flex flex-col gap-3">
        <h1
          className="mb-2 inline-flex gap-2 text-2xl font-bold"
          style={{ fontFamily: 'var(--font-bodoni)' }}
        >
          <span>Duyet Le</span>
          <Separator orientation="vertical" />
          <span className="text-red-500">Résumé</span>
        </h1>

        <InlineLink
          links={[
            <div key="country">Vietnam</div>,
            <div key="yob">1995</div>,
            <div key="email">me@duyet.net</div>,
            <Link
              className="hover:underline"
              key="homepage"
              href="https://duyet.net"
            >
              https://duyet.net
            </Link>,

            <HoverCard key="github" openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <Link
                  className="hover:underline"
                  href="https://github.com/duyet"
                >
                  https://github.com/duyet
                </Link>
              </HoverCardTrigger>
              <HoverCardContent>
                <Link
                  className="hover:underline"
                  href="https://linkedin.com/in/duyet"
                >
                  <div className="flex flex-col gap-2">
                    <GithubIcon />
                    <div>
                      <strong>Github: </strong>
                      <span>@duyet</span>
                    </div>
                  </div>
                </Link>
              </HoverCardContent>
            </HoverCard>,

            <HoverCard key="linkedin" openDelay={0} closeDelay={0}>
              <HoverCardTrigger asChild>
                <Link
                  className="hover:underline"
                  href="https://linkedin.com/in/duyet"
                >
                  https://linkedin.com/in/duyet
                </Link>
              </HoverCardTrigger>
              <HoverCardContent>
                <Link
                  className="hover:underline"
                  href="https://linkedin.com/in/duyet"
                >
                  <div className="flex flex-col gap-2">
                    <LinkedinIcon />
                    <div>
                      <strong>Linkedin: </strong>
                      <span>/in/duyet</span>
                    </div>
                  </div>
                </Link>
              </HoverCardContent>
            </HoverCard>,
          ]}
        />
        <Overview className="text-sm">
          Data Engineer with 6+ years of experience in modern data warehousing,
          distributed systems, and cloud computing. Proficient in Spark,
          Airflow, Python, Rust.
        </Overview>
      </header>

      <Section title="Experience">
        <div className="flex flex-col gap-5">
          <ExperienceItem
            title="Sr. Data Engineer"
            company="Cartrack"
            period="OCTOBER 2023 - CURRENT"
            responsibilities={[
              'Migrated 350TB+ Iceberg Data Lake to ClickHouse on Kubernetes.',
              'Enhanced ClickHouse for 300% better data compression and 2x-100x faster queries.',
              'Deprecated old tools (Spark, Iceberg, Trino) and automated operations with Airflow.',
            ]}
          />
          <ExperienceItem
            title="Sr. Data Engineer"
            company="Fossil Group Inc"
            period="OCTOBER 2018 - JULY 2023"
            responsibilities={[
              'Promoted to lead Data Platform Team within 2 years.',
              'Cut monthly costs from $45,000 to $20,000. Developed tools for Data Monitoring, Data Catalog, and Self-service Analytics',
              <Link
                href="https://blog.duyet.net/2023/06/fossil-data-platform-written-rust.html"
                key="next-gen-data-platform"
              >
                Designed next-gen Data Platform in Rust.
              </Link>,
              'Managed a team of 4 data engineers and 2 data analysts to provide end-to-end analytics solutions to stakeholders. Raised data-driven awareness throughout the organization and encouraged everyone to take a more data-driven approach to problem-solving.',
            ]}
          />
          <ExperienceItem
            title="Sr. Data Engineer"
            company="FPT Software"
            period="JUNE 2017 - OCTOBER 2018"
            responsibilities={[
              'Built data pipelines processing 2TB/day with AWS for a Recommendation System',
              'Ingested and transformed 1TB+/day into Data Lake using Azure Cloud',
            ]}
          />
          <ExperienceItem
            title="Data Engineer"
            company="John von Neumann Institute - Vietnam National University"
            period="SEPTEMBER 2015 - JUNE 2017"
            responsibilities={[
              'Developed data pipelines and visualizations.',
              'Deployed ML models for customer lifetime value, churn, sales optimization, and recruitment.',
              'Publication: Skill2vec - Relevant Skills from Job Description',
            ]}
          />
        </div>
      </Section>

      <Section title="Education">
        <Education
          major="Bachelor's degree, Information System"
          note="Thesis: Network of career skills and support an optimal job search"
          period="2013 - 2017"
          university="University of Information Technology - HCMC"
        />
      </Section>

      <Section title="Skills">
        <div className="flex flex-col gap-2">
          <div>
            <strong>Data Engineering:</strong>{' '}
            <Link href="https://blog.duyet.net/tag/clickhouse">ClickHouse</Link>
            {', '}
            <Link href="https://blog.duyet.net/tag/spark">Spark</Link>
            {', '} Kafka{', '}
            <Link href="https://blog.duyet.net/tag/airflow">Airflow</Link>
            {', '}
            AWS, BigQuery, Data Studio{', '}
            <Link href="https://blog.duyet.net/tag/python">Python</Link>
            {', '}
            <Link href="https://blog.duyet.net/tag/rust">Rust</Link>
            {', '}
            <Link href="https://blog.duyet.net/tag/typescript">Typescript</Link>
            .
          </div>
          <div>
            <strong>DevOps:</strong> CI/CD{', '}
            <Link href="https://blog.duyet.net/tag/kubernetes">Kubernetes</Link>
            {', '}
            <Link href="https://blog.duyet.net/tag/helm">Helm</Link>.
          </div>
        </div>
      </Section>

      <div className="print:hide mx-auto mt-10">
        <Link href="/pdf" title="PDF Format">
          <FileTextIcon />
        </Link>
      </div>
    </div>
  )
}
