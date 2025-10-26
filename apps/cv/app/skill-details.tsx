import {
  SiApacheairflow,
  SiApachespark,
  SiClickhouse,
  SiHelm,
  SiKubernetes,
  SiPython,
  SiRust,
  SiTypescript,
} from '@icons-pack/react-simple-icons'
import Link from 'next/link'

import { Skill } from '@/components/skill'

export function SkillRust() {
  return (
    <Skill
      skill="Rust"
      url="https://blog.duyet.net/tag/rust"
      icon={<SiRust />}
      note={
        <span>
          I am new and have been working with{' '}
          <Link
            href="https://blog.duyet.net/2021/11/rust-data-engineering.html"
            target="_blank"
            className="underline decoration-slate-300 decoration-wavy decoration-1 underline-offset-4"
          >
            Rust
          </Link>{' '}
          for about 2 years, during which I have developed and deployed a
          production{' '}
          <Link
            href="https://blog.duyet.net/2023/06/fossil-data-platform-written-rust.html"
            target="_blank"
            className="underline decoration-slate-300 decoration-wavy decoration-1 underline-offset-4"
          >
            Data Platform at Fossil
          </Link>
          , created multiple command line applications, and documented all my
          experiences in Vietnamese through{' '}
          <Link
            href="https://duyet.net/rust"
            target="_blank"
            className="underline decoration-slate-300 decoration-wavy decoration-1 underline-offset-4"
          >
            Rust Tiếng Việt
          </Link>
        </span>
      }
    />
  )
}

export function SkillTypescript() {
  return (
    <Skill
      skill="Typescript"
      url="https://blog.duyet.net/tag/typescript"
      icon={<SiTypescript />}
      note={
        <span>
          I&apos;ve used TypeScript to complement my Data Engineering work.
          <br />
          From building data visualization to present insights, to developing
          internal tools for data serving or monitoring. Some of open-source
          works are:{' '}
          <Link
            href="https://github.com/duyet/clickhouse-monitoring"
            target="_blank"
            className="underline decoration-slate-300 decoration-wavy decoration-1 underline-offset-4"
          >
            clickhouse-monitoring
          </Link>{' '}
          or{' '}
          <Link
            href="https://github.com/duyet/monorepo"
            target="_blank"
            className="underline decoration-slate-300 decoration-wavy decoration-1 underline-offset-4"
          >
            this CV itself
          </Link>
        </span>
      }
    />
  )
}

export function SkillHelm() {
  return (
    <Skill
      skill="Helm Charts"
      url="https://blog.duyet.net/tag/helm"
      icon={<SiHelm />}
      note={
        <span>
          Checkout{' '}
          <Link
            href="https://github.com/duyet/charts"
            target="_blank"
            className="underline decoration-slate-300 decoration-wavy decoration-1 underline-offset-4"
          >
            duyet/charts
          </Link>
        </span>
      }
    />
  )
}

export function SkillKubernetes() {
  return (
    <Skill
      skill="Kubernetes"
      url="https://blog.duyet.net/tag/kubernetes"
      icon={<SiKubernetes />}
      note={
        <span>
          Familiarity with fundamental Kubernetes concepts such as Deployment,
          Statefulset, Service, Ingress, and PVC, etc.
          <br />
          Various environments from AWS EKS to self-hosted (Rancher RKE or
          minikube).
        </span>
      }
    />
  )
}

export function SkillPython() {
  return (
    <Skill
      skill="Python"
      url="https://blog.duyet.net/tag/python"
      icon={<SiPython />}
      note={
        <span>
          With over 5 years of experience, I have developed expertise in
          building Data Platforms, Data Processing, CLI, API, and Web
          Applications
        </span>
      }
    />
  )
}

export function SkillSpark() {
  return (
    <Skill
      skill="Spark"
      url="https://blog.duyet.net/tag/spark"
      icon={<SiApachespark />}
      note={
        <span>
          I&apos;ve been using Spark extensively since I started as a Data
          Engineer, experience running Spark with <strong>YARN</strong>,
          Databricks, <strong>AWS EMR</strong>, as well as{' '}
          <Link
            href="https://blog.duyet.net/2022/03/spark-kubernetes-at-fossil.html"
            target="_blank"
            className="underline decoration-slate-300 decoration-wavy decoration-1 underline-offset-4"
          >
            <strong>Kubernetes</strong>
          </Link>
          . Haven&apos;t been using it as much lately due to the convenience
          offered by{' '}
          <Link
            href="https://blog.duyet.net/tag/clickhouse"
            target="_blank"
            className="underline decoration-slate-300 decoration-wavy decoration-1 underline-offset-4"
          >
            ClickHouse
          </Link>
          {' and '}
          <Link
            href="https://blog.duyet.net/2023/09/duckdb.html"
            target="_blank"
            className="underline decoration-slate-300 decoration-wavy decoration-1 underline-offset-4"
          >
            DuckDB
          </Link>
          .
        </span>
      }
    />
  )
}

export function SkillClickHouse() {
  return (
    <Skill
      skill="ClickHouse"
      url="https://blog.duyet.net/tag/clickhouse"
      icon={<SiClickhouse />}
      note={
        <span>
          Experienced in managing some Terabyte-scale ClickHouse clusters
          deployed on Kubernetes, which have many challenges for troubleshooting
          and complex issues.
        </span>
      }
    />
  )
}

export function SkillCICD() {
  return (
    <Skill
      skill="CI/CD"
      note={<span>I am familiar with Jenkins and GitHub Actions</span>}
    />
  )
}

export function SkillAirflow() {
  return (
    <Skill
      skill="Airflow"
      url="https://blog.duyet.net/tag/airflow"
      icon={<SiApacheairflow />}
    />
  )
}
