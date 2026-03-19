import { Section } from "@/components/section";
import {
  SkillAirflow,
  SkillCICD,
  SkillClickHouse,
  SkillHelm,
  SkillKubernetes,
  SkillLangGraph,
  SkillPython,
  SkillRust,
  SkillSpark,
  SkillTypescript,
} from "@/app/skill-details";
import { Skill } from "@/components/skill";
import type { ReactNode } from "react";

function SkillRow({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <p className="text-[15px] leading-7 text-neutral-700 dark:text-neutral-300">
      <strong className="text-neutral-900 dark:text-neutral-100">{title}:</strong>{" "}
      {children}
    </p>
  );
}

export function SkillsSection() {
  return (
    <Section title="Skills">
      <div className="flex flex-col gap-2">
        <SkillRow title="Data Engineering">
          <Skill skill="LlamaIndex" url="https://www.llamaindex.ai/" />
          {", "}
          <Skill skill="AI SDK" url="https://ai-sdk.dev/" />
          {", "}
          <SkillLangGraph />
          {", "}
          <SkillClickHouse />
          {", "}
          <SkillSpark />
          {", "}
          <Skill skill="Kafka" />
          {", "}
          <SkillAirflow />
          {", "}
          <Skill skill="AWS" />
          {", "}
          <Skill skill="BigQuery" />
          {", "}
          <Skill skill="Data Studio" />
          {", "}
          <SkillPython />
          {", "}
          <SkillRust />
          {", "}
          <SkillTypescript />
          .
        </SkillRow>

        <SkillRow title="DevOps">
          <SkillCICD />
          {", "}
          <SkillKubernetes />
          {", "}
          <SkillHelm />
          .
        </SkillRow>
      </div>
    </Section>
  );
}
