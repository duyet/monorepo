import {
  SiGithub as GithubIcon,
  SiLinkedin as LinkedinIcon,
  SiApacheairflow,
  SiApachespark,
  SiClickhouse,
  SiHelm,
  SiKubernetes,
  SiPython,
  SiRust,
  SiTypescript,
} from '@icons-pack/react-simple-icons'
import { FileTextIcon } from 'lucide-react'
import type { ImageProps } from 'next/image'
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

import { HoverLinks } from '@/components/hover-links'
import { Skill } from '@/components/skill'
import FossilLogo from '@/public/fossil.svg'
import FptLogo from '@/public/fpt.svg'
import JvnLogo from '@/public/jvn.png'
import CartrackLogo from '@/public/karo.svg'

export const dynamic = 'force-static'

export default function Page() {
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
            companyUrl="https://cartrack.us"
            companyLogo={CartrackLogo as ImageProps['src']}
            companyLogoClassName="h-5 w-auto"
            period="OCTOBER 2023 - CURRENT"
            responsibilities={[
              <span key="migrate-iceberg-to-clickhouse">
                Migrated 350TB+ Iceberg Data Lake to{' '}
                <HoverLinks
                  text="ClickHouse on Kubernetes"
                  links={[
                    {
                      text: 'ClickHouse on Kubernetes',
                      href: 'https://blog.duyet.net/2024/03/clickhouse-on-kubernetes.html',
                    },
                    {
                      text: 'Monitoring ClickHouse on Kubernetes',
                      href: 'https://blog.duyet.net/2024/03/clickhouse-monitoring.html',
                    },
                    {
                      text: 'Why ClickHouse Should Be the Go-To Choice for Your Next Data Platform?',
                      href: 'https://blog.duyet.net/2023/01/clickhouse.html',
                    },
                  ]}
                />
                .
              </span>,
              'Enhanced ClickHouse for 300% better data compression and 2x-100x faster queries.',
              'Deprecated old tools (Spark, Iceberg, Trino) and automated operations with Airflow.',
            ]}
          />
          <ExperienceItem
            title="Sr. Data Engineer"
            company="Fossil Group Inc"
            companyUrl="https://fossil.com"
            companyLogo={FossilLogo as ImageProps['src']}
            companyLogoClassName="h-auto w-10"
            period="OCTOBER 2018 - JULY 2023"
            responsibilities={[
              'Optimize monthly costs from $45,000 to $20,000 (GCP and AWS Cloud).',
              'Managed a team of 4 data engineers and 2 data analysts to provide end-to-end analytics solutions to stakeholders. Raised data-driven awareness throughout the organization and encouraged everyone to take a more data-driven approach to problem-solving.',
              <Link
                href="https://blog.duyet.net/2023/06/fossil-data-platform-written-rust.html"
                key="next-gen-data-platform"
              >
                Designed next-gen Data Platform in Rust ↗︎
              </Link>,
              <span key="k8s-deploy">
                Developed tools for Data Monitoring, Data Catalog, and
                Self-service Analytics for internal teams with{' '}
                <HoverLinks
                  text="everything deployed on Kubernetes"
                  links={[
                    {
                      text: 'Spark on Kubernetes tại Fossil︎',
                      href: 'https://blog.duyet.net/2022/03/spark-kubernetes-at-fossil.html',
                    },
                    {
                      text: 'Spark on Kubernetes Performance Tuning︎',
                      href: 'https://blog.duyet.net/2021/04/spark-kubernetes-performance-tuning.html',
                    },
                    {
                      text: 'ClickHouse on Kubernetes︎',
                      href: 'https://blog.duyet.net/2024/03/clickhouse-on-kubernetes.html',
                    },
                    {
                      text: 'Fossil Data Platform Rewritten in Rust 🦀︎',
                      href: 'https://blog.duyet.net/2023/06/fossil-data-platform-written-rust.html',
                    },
                  ]}
                />
                .
              </span>,
            ]}
          />
          <ExperienceItem
            title="Sr. Data Engineer"
            company="FPT Software"
            companyLogo={FptLogo as ImageProps['src']}
            companyLogoClassName="h-auto w-7"
            period="JUNE 2017 - OCTOBER 2018"
            responsibilities={[
              'Built data pipelines processing 2TB/day with AWS for a Recommendation System',
              'Ingested and transformed 1TB+/day into Data Lake using Azure Cloud',
            ]}
          />
          <ExperienceItem
            title="Data Engineer"
            company="John von Neumann Institute"
            companyLogo={JvnLogo as ImageProps['src']}
            companyLogoClassName="h-5 w-auto"
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
          university="University of Information Technology"
        />
      </Section>

      <Section title="Skills">
        <div className="flex flex-col gap-2">
          <div>
            <strong>Data Engineering:</strong>{' '}
            <Skill
              skill="ClickHouse"
              url="https://blog.duyet.net/tag/clickhouse"
              icon={<SiClickhouse />}
            />
            {', '}
            <Skill
              skill="Spark"
              url="https://blog.duyet.net/tag/spark"
              icon={<SiApachespark />}
            />
            {', '}
            <Skill skill="Kafka" />
            {', '}
            <Skill
              skill="Airflow"
              url="https://blog.duyet.net/tag/airflow"
              icon={<SiApacheairflow />}
            />
            {', '}
            <Skill skill="AWS" />
            {', '}
            <Skill skill="BigQuery" />
            {', '}
            <Skill skill="Data Studio" />
            {', '}
            <Skill
              skill="Python"
              url="https://blog.duyet.net/tag/python"
              icon={<SiPython />}
            />
            {', '}
            <Skill
              skill="Rust"
              url="https://blog.duyet.net/tag/rust"
              icon={<SiRust />}
            />
            {', '}
            <Skill
              skill="Typescript"
              url="https://blog.duyet.net/tag/typescript"
              icon={<SiTypescript />}
            />
            .
          </div>
          <div>
            <strong>DevOps:</strong> <Skill skill="CI/CD" />
            {', '}
            <Skill
              skill="Kubernetes"
              url="https://blog.duyet.net/tag/kubernetes"
              icon={<SiKubernetes />}
            />
            {', '}
            <Skill
              skill="Helm"
              url="https://blog.duyet.net/tag/helm"
              icon={<SiHelm />}
            />
            .
          </div>
        </div>
      </Section>

      <div className="mx-auto mt-10 print:hidden">
        <Link href="/pdf" title="PDF Format">
          <FileTextIcon />
        </Link>
      </div>
    </div>
  )
}
