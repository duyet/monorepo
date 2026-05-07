import {
  SkillAirflow,
  SkillCICD,
  SkillClickHouse,
  SkillHelm,
  SkillKubernetes,
  SkillLangGraph,
} from "@/components/skill-details";
import { Section } from "@/components/section";
import { Skill } from "@/components/skill";

export function SkillsSection() {
  return (
    <Section title="Technical Skills">
      <div className="text-[14px] leading-5 text-neutral-700 dark:text-neutral-300">
        <span>
          <strong className="text-neutral-900 dark:text-neutral-100">
            Languages &amp; Frameworks:{" "}
          </strong>
          <Skill skill="Python" url="https://blog.duyet.net/tag/python" />
          {", "}
          <Skill skill="Rust" url="https://blog.duyet.net/tag/rust" />
          {", "}
          <Skill
            skill="TypeScript"
            url="https://blog.duyet.net/tag/typescript"
          />
          {", "}
          <Skill skill="SQL" />
          {", "}
          <Skill skill="Spark" url="https://blog.duyet.net/tag/spark" />
        </span>
        <br />
        <span>
          <strong className="text-neutral-900 dark:text-neutral-100">
            Data &amp; AI:{" "}
          </strong>
          <Skill skill="LlamaIndex" url="https://www.llamaindex.ai/" />
          {", "}
          <Skill skill="AI SDK" url="https://ai-sdk.dev/" />
          {", "}
          <SkillLangGraph />
          {", "}
          <SkillClickHouse />
          {", "}
          <Skill skill="Kafka" />
          {", "}
          <SkillAirflow />
          {", "}
          <Skill skill="BigQuery" />
          {", "}
          <Skill skill="AWS" />
        </span>
        <br />
        <span>
          <strong className="text-neutral-900 dark:text-neutral-100">
            DevOps:{" "}
          </strong>
          <SkillCICD />
          {", "}
          <SkillKubernetes />
          {", "}
          <SkillHelm />
        </span>
      </div>
    </Section>
  );
}
