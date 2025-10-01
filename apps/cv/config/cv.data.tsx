import { GitHubLogoIcon, LinkedInLogoIcon } from '@radix-ui/react-icons'
import Link from 'next/link'

import { HoverLinks } from '@/components/hover-links'
import FossilLogo from '@/public/fossil.svg'
import FptLogo from '@/public/fpt.svg'
import JvnLogo from '@/public/jvn.png'
import CartrackLogo from '@/public/karo.svg'

import type { CVData, LLMsInfo } from './cv.types'

export const cvData: CVData = {
  personal: {
    name: 'Duyet Le',
    title: 'Résumé',
    email: 'me@duyet.net',
    overview:
      'Data Engineer with 6+ years of experience in modern data warehousing, distributed systems, and cloud computing. Proficient in ClickHouse, Spark, Airflow, Python, Rust.',
    contacts: [
      {
        id: 'email',
        type: 'email',
        label: 'me@duyet.net',
        url: 'mailto:me@duyet.net',
      },
      {
        id: 'website',
        type: 'website',
        label: 'https://duyet.net',
        url: 'https://duyet.net',
      },
      {
        id: 'github',
        type: 'github',
        label: 'https://github.com/duyet',
        url: 'https://github.com/duyet',
        hoverContent: {
          icon: <GitHubLogoIcon />,
          title: 'Github:',
          subtitle: '@duyet',
        },
      },
      {
        id: 'linkedin',
        type: 'linkedin',
        label: 'https://linkedin.com/in/duyet',
        url: 'https://linkedin.com/in/duyet',
        hoverContent: {
          icon: <LinkedInLogoIcon />,
          title: 'Linkedin:',
          subtitle: '/in/duyet',
        },
      },
    ],
  },
  experience: [
    {
      id: 'cartrack',
      title: 'Sr. Data Engineer',
      company: 'Cartrack',
      companyUrl: 'https://cartrack.us',
      companyLogo: CartrackLogo,
      companyLogoClassName: 'h-5 w-auto',
      from: new Date('2023-10'),
      responsibilities: [
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
          item: 'Multi-agent LLM + RAG (LlamaIndex, Qdrant, ClickHouse text2sql, Nextjs, etc)',
        },
      ],
    },
    {
      id: 'fossil',
      title: 'Sr. Data Engineer',
      company: 'Fossil Group Inc',
      companyUrl: 'https://fossil.com',
      companyLogo: FossilLogo,
      companyLogoClassName: 'h-auto w-10',
      from: new Date('2018-10'),
      to: new Date('2023-07'),
      responsibilities: [
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
      ],
    },
    {
      id: 'fpt',
      title: 'Sr. Data Engineer',
      company: 'FPT Software',
      companyLogo: FptLogo,
      companyLogoClassName: 'h-auto w-7',
      from: new Date('2017-06'),
      to: new Date('2018-10'),
      responsibilities: [
        {
          id: 1,
          item: 'Built data pipelines processing 2TB/day with AWS for a Recommendation System',
        },
        {
          id: 2,
          item: (
            <span key="azure">
              Ingested and transformed 1TB+/day into Data Lake using Azure Cloud
              and Databricks
            </span>
          ),
        },
      ],
    },
    {
      id: 'jvn',
      title: 'Data Engineer',
      company: 'John von Neumann Institute',
      companyLogo: JvnLogo,
      companyLogoClassName: 'h-5 w-auto',
      from: new Date('2015-09'),
      to: new Date('2017-06'),
      responsibilities: [
        {
          id: 1,
          item: 'Developed data pipelines, data cleaning and visualizations for adhoc problems.',
        },
        {
          id: 2,
          item: 'Train and deployed ML models: customer lifetime value, churn prediction, sales optimization, recruitment optimization, etc.',
        },
      ],
    },
  ],
  education: [
    {
      id: 'uit',
      major: "Bachelor's degree, Information System",
      thesis:
        'Thesis: Network of career skills and support an optimal job search',
      thesisUrl: 'https://arxiv.org/pdf/1707.09751',
      university: 'University of Information Technology',
    },
  ],
  skills: [
    {
      id: 'data-engineering',
      name: 'Data Engineering',
      skills: [
        { id: 'clickhouse', name: 'ClickHouse' },
        { id: 'spark', name: 'Spark' },
        { id: 'kafka', name: 'Kafka' },
        { id: 'airflow', name: 'Airflow' },
        { id: 'aws', name: 'AWS' },
        { id: 'bigquery', name: 'BigQuery' },
        { id: 'data-studio', name: 'Data Studio' },
        { id: 'python', name: 'Python' },
        { id: 'rust', name: 'Rust' },
        { id: 'typescript', name: 'Typescript' },
      ],
    },
    {
      id: 'devops',
      name: 'DevOps',
      skills: [
        { id: 'cicd', name: 'CI/CD' },
        { id: 'kubernetes', name: 'Kubernetes' },
        { id: 'helm', name: 'Helm' },
      ],
    },
  ],
}

export const llmsInfo: LLMsInfo = {
  name: 'Duyet Le',
  role: 'Senior Data Engineer',
  email: 'me@duyet.net',
  website: 'https://duyet.net',
  bio: 'Data Engineer with 6+ years of experience in modern data warehousing, distributed systems, and cloud computing.',
  expertise: [
    'Data Engineering',
    'Distributed Systems',
    'Cloud Computing',
    'Data Warehousing',
    'Machine Learning Infrastructure',
    'DevOps',
  ],
  currentRole: {
    title: 'Sr. Data Engineer',
    company: 'Cartrack',
    duration: 'Oct 2023 - Present',
  },
  keyAchievements: [
    'Migrated 350TB+ Iceberg Data Lake to ClickHouse on Kubernetes',
    'Enhanced ClickHouse for 300% better data compression and 2x-100x faster queries',
    'Optimized cloud costs from $45,000 to $20,000/month at Fossil Group',
    'Managed team of 6 engineers and analysts',
    'Designed next-gen Data Platform in Rust',
    'Built multi-agent LLM + RAG systems',
  ],
  technologies: [
    'ClickHouse',
    'Apache Spark',
    'Apache Airflow',
    'Python',
    'Rust',
    'TypeScript',
    'Kubernetes',
    'AWS',
    'GCP',
    'Kafka',
    'BigQuery',
    'Helm',
  ],
  links: {
    github: 'https://github.com/duyet',
    blog: 'https://blog.duyet.net',
    linkedin: 'https://linkedin.com/in/duyet',
  },
}
