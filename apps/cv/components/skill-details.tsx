import {
  SiApacheairflow,
  SiApachespark,
  SiClickhouse,
  SiHelm,
  SiKubernetes,
  SiPython,
  SiRust,
  SiTypescript,
} from "@icons-pack/react-simple-icons";

import { externalLinkClassName } from "./link-styles";
import { ResumeLink } from "./resume-link";
import { Skill } from "./skill";

export function SkillRust() {
  return (
    <Skill
      skill="Rust"
      url="https://blog.duyet.net/tag/rust"
      icon={<SiRust />}
      note={
        <span>
          I am new and have been working with{" "}
          <ResumeLink
            href="https://blog.duyet.net/2021/11/rust-data-engineering.html"
            external
            className={externalLinkClassName}
          >
            Rust
          </ResumeLink>{" "}
          for about 2 years, during which I have developed and deployed a
          production{" "}
          <ResumeLink
            href="https://blog.duyet.net/2023/06/fossil-data-platform-written-rust.html"
            external
            className={externalLinkClassName}
          >
            Data Platform at Fossil
          </ResumeLink>
          , created multiple command line applications, and documented all my
          experiences in Vietnamese through{" "}
          <ResumeLink
            href="https://duyet.net/rust"
            external
            className={externalLinkClassName}
          >
            Rust Tiếng Việt
          </ResumeLink>
        </span>
      }
    />
  );
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
          works are:{" "}
          <ResumeLink
            href="https://github.com/duyet/clickhouse-monitoring"
            external
            className={externalLinkClassName}
          >
            clickhouse-monitoring
          </ResumeLink>{" "}
          or{" "}
          <ResumeLink
            href="https://github.com/duyet/monorepo"
            external
            className={externalLinkClassName}
          >
            this CV itself
          </ResumeLink>
        </span>
      }
    />
  );
}

export function SkillHelm() {
  return (
    <Skill
      skill="Helm Charts"
      url="https://blog.duyet.net/tag/helm"
      icon={<SiHelm />}
      note={
        <span>
          Checkout{" "}
          <ResumeLink
            href="https://github.com/duyet/charts"
            external
            className={externalLinkClassName}
          >
            duyet/charts
          </ResumeLink>
        </span>
      }
    />
  );
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
  );
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
  );
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
          Databricks, <strong>AWS EMR</strong>, as well as{" "}
          <ResumeLink
            href="https://blog.duyet.net/2022/03/spark-kubernetes-at-fossil.html"
            external
            className={externalLinkClassName}
          >
            <strong>Kubernetes</strong>
          </ResumeLink>
          . Haven&apos;t been using it as much lately due to the convenience
          offered by{" "}
          <ResumeLink
            href="https://blog.duyet.net/tag/clickhouse"
            external
            className={externalLinkClassName}
          >
            ClickHouse
          </ResumeLink>
          {" and "}
          <ResumeLink
            href="https://blog.duyet.net/2023/09/duckdb.html"
            external
            className={externalLinkClassName}
          >
            DuckDB
          </ResumeLink>
          .
        </span>
      }
    />
  );
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
  );
}

export function SkillCICD() {
  return (
    <Skill
      skill="CI/CD"
      note={<span>I am familiar with Jenkins and GitHub Actions</span>}
    />
  );
}

export function SkillAirflow() {
  return (
    <Skill
      skill="Airflow"
      url="https://blog.duyet.net/tag/airflow"
      icon={<SiApacheairflow />}
    />
  );
}

export function SkillLangGraph() {
  return (
    <Skill
      skill="LangGraph"
      note={
        <span>
          Agent orchestration and stateful workflow graphs for multi-step LLM
          systems.
        </span>
      }
    />
  );
}
