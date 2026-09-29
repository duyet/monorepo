import {
  SiApacheairflow,
  SiClickhouse,
  SiHelm,
  SiKubernetes,
} from "@icons-pack/react-simple-icons";

import { externalLinkClassName } from "./link-styles";
import { ResumeLink } from "./resume-link";
import { Skill } from "./skill";

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
