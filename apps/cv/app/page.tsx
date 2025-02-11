import {
  SiGithub as GithubIcon,
  SiLinkedin as LinkedinIcon,
} from '@icons-pack/react-simple-icons'
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

import {
  SkillAirflow,
  SkillCICD,
  SkillClickHouse,
  SkillHelm,
  SkillKubernetes,
  SkillPython,
  SkillRust,
  SkillSpark,
  SkillTypescript,
} from './skill-details'

export const dynamic = 'force-static'

export default function Page() {
  return (
    <div className="m-auto flex min-h-screen flex-col gap-8 text-sm text-black">
      <header className="flex flex-col gap-3">
        <h1
          className="mb-2 inline-flex gap-2 text-2xl font-bold"
          style={{ fontFamily: 'var(--font-lora)' }}
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
              className="hover:underline hover:decoration-slate-300 hover:decoration-wavy hover:decoration-1 hover:underline-offset-4"
              key="homepage"
              href="https://duyet.net"
              target="_blank"
            >
              https://duyet.net
            </Link>,

            <HoverCard key="github" openDelay={100} closeDelay={100}>
              <HoverCardTrigger asChild>
                <Link
                  className="hover:underline hover:decoration-slate-300 hover:decoration-wavy hover:decoration-1 hover:underline-offset-4"
                  href="https://github.com/duyet"
                  target="_blank"
                >
                  https://github.com/duyet
                </Link>
              </HoverCardTrigger>
              <HoverCardContent>
                <Link
                  className="hover:underline hover:decoration-slate-300 hover:decoration-wavy hover:decoration-1 hover:underline-offset-4"
                  href="https://linkedin.com/in/duyet"
                  target="_blank"
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

            <HoverCard key="linkedin" openDelay={100} closeDelay={0}>
              <HoverCardTrigger asChild>
                <Link
                  className="hover:underline hover:decoration-slate-300 hover:decoration-wavy hover:decoration-1 hover:underline-offset-4"
                  href="https://linkedin.com/in/duyet"
                  target="_blank"
                >
                  https://linkedin.com/in/duyet
                </Link>
              </HoverCardTrigger>
              <HoverCardContent>
                <Link
                  className="hover:underline hover:decoration-slate-300 hover:decoration-wavy hover:decoration-1 hover:underline-offset-4"
                  href="https://linkedin.com/in/duyet"
                  target="_blank"
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
          distributed systems, and cloud computing. Proficient in <SkillSpark />
          {', '}
          <SkillAirflow />
          {', '}
          <SkillPython />
          {', '}
          <SkillRust />.
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
            from={new Date('2023-10')}
            responsibilities={[
              {
                id: 1,
                item: 'Deprecated old stack (Spark, Iceberg, Trino) replaced by ClickHouse.',
              },
              {
                id: 2,
                item: (
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
                  </span>
                ),
              },
              {
                id: 3,
                item: 'Enhanced ClickHouse for 300% better data compression and 2x-100x faster queries, compared with Trino + Iceberg',
              },
              {
                id: 4,
                item: 'Automated operations with Airflow: data replication, data processing, healthchecks, etc.',
              },
              {
                id: 5,
                item: 'LLM + RAG',
              },
            ]}
          />
          <ExperienceItem
            title="Sr. Data Engineer"
            company="Fossil Group Inc"
            companyUrl="https://fossil.com"
            companyLogo={FossilLogo as ImageProps['src']}
            companyLogoClassName="h-auto w-10"
            from={new Date('2018-10')}
            to={new Date('2023-07')}
            responsibilities={[
              {
                id: 1,
                item: 'Optimize monthly costs from $45,000 to $20,000 (GCP and AWS Cloud).',
              },
              {
                id: 2,
                item: 'Managed a team of 4 data engineers and 2 data analysts to provide end-to-end analytics solutions to stakeholders. Raised data-driven awareness throughout the organization and encouraged everyone to take a more data-driven approach to problem-solving.',
              },
              {
                id: 3,
                item: (
                  <Link
                    href="https://blog.duyet.net/2023/06/fossil-data-platform-written-rust.html"
                    key="next-gen-data-platform"
                    className="hover:underline hover:decoration-slate-300 hover:decoration-wavy hover:decoration-1 hover:underline-offset-4"
                    target="_blank"
                  >
                    Designed next-gen Data Platform in Rust ↗︎
                  </Link>
                ),
              },
              {
                id: 4,
                item: (
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
                  </span>
                ),
              },
            ]}
          />
          <ExperienceItem
            title="Sr. Data Engineer"
            company="FPT Software"
            companyLogo={FptLogo as ImageProps['src']}
            companyLogoClassName="h-auto w-7"
            from={new Date('2017-06')}
            to={new Date('2018-10')}
            responsibilities={[
              {
                id: 1,
                item: 'Built data pipelines processing 2TB/day with AWS for a Recommendation System',
              },
              {
                id: 2,
                item: (
                  <span key="azure">
                    Ingested and transformed 1TB+/day into Data Lake using Azure
                    Cloud and Databricks
                  </span>
                ),
              },
            ]}
          />
          <ExperienceItem
            title="Data Engineer"
            company="John von Neumann Institute"
            companyLogo={JvnLogo as ImageProps['src']}
            companyLogoClassName="h-5 w-auto"
            from={new Date('2015-09')}
            to={new Date('2017-06')}
            responsibilities={[
              {
                id: 1,
                item: 'Developed data pipelines, data cleaning and visualizations for adhoc problems.',
              },
              {
                id: 2,
                item: 'Train and deployed ML models: customer lifetime value, churn prediction, sales optimization, recruitment optimization, etc.',
              },
            ]}
          />
        </div>
      </Section>

      <Section title="Education">
        <Education
          major="Bachelor's degree, Information System"
          thesis="Thesis: Network of career skills and support an optimal job search"
          thesisUrl="https://arxiv.org/pdf/1707.09751"
          university="University of Information Technology"
        />
      </Section>

      <Section title="Skills">
        <div className="flex flex-col gap-2">
          <div>
            <strong>Data Engineering:</strong> <SkillClickHouse />
            {', '}
            <SkillSpark />
            {', '}
            <Skill skill="Kafka" />
            {', '}
            <SkillAirflow />
            {', '}
            <Skill skill="AWS" />
            {', '}
            <Skill skill="BigQuery" />
            {', '}
            <Skill skill="Data Studio" />
            {', '}
            <SkillPython />
            {', '}
            <SkillRust />
            {', '}
            <SkillTypescript />.
          </div>
          <div>
            <strong>DevOps:</strong> <SkillCICD />
            {', '}
            <SkillKubernetes />
            {', '}
            <SkillHelm />.
          </div>
        </div>
      </Section>
    </div>
  )
}
