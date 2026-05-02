import type { ReactNode } from "react";
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
} from "@/components/skill-details";
import { Section } from "@/components/section";
import { Skill } from "@/components/skill";

function SkillRow({ title, children }: { title: string; children: ReactNode }) {
  return (
    <p className="text-[15px] leading-7 text-neutral-800 dark:text-foreground/80 print:text-[8.2pt] print:leading-snug">
      <strong className="text-neutral-900 dark:text-foreground">
        {title}:
      </strong>{" "}
      {children}
    </p>
  );
}

export function SkillsSection() {
  return (
    <Section title="Skills">
      <div className="flex flex-col gap-2 print:gap-1">
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
          <SkillTypescript />.
        </SkillRow>

        <SkillRow title="DevOps">
          <SkillCICD />
          {", "}
          <SkillKubernetes />
          {", "}
          <SkillHelm />.
        </SkillRow>
      </div>
    </Section>
  );
}
