import Link from 'next/link'

import { Education } from '@/components/education'
import { ExperienceItem } from '@/components/experience'
import { InlineLink } from '@/components/inline-link'
import { Overview } from '@/components/overview'
import { Section } from '@/components/section'
import { Skill } from '@/components/skill'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { Separator } from '@/components/ui/separator'

import { cvData } from '@/config/cv.data'
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
  const { personal, experience, education } = cvData

  const renderContactLinks = () => {
    return personal.contacts.map((contact) => {
      if (contact.type === 'email') {
        return <div key={contact.id}>{contact.label}</div>
      }

      if (contact.hoverContent) {
        return (
          <HoverCard key={contact.id} openDelay={100} closeDelay={100}>
            <HoverCardTrigger asChild>
              <Link
                className="hover:underline hover:decoration-slate-300 hover:decoration-wavy hover:decoration-1 hover:underline-offset-4"
                href={contact.url}
                target="_blank"
              >
                {contact.label}
              </Link>
            </HoverCardTrigger>
            <HoverCardContent>
              <Link
                className="hover:underline hover:decoration-slate-300 hover:decoration-wavy hover:decoration-1 hover:underline-offset-4"
                href={contact.url}
                target="_blank"
              >
                <div className="flex flex-col gap-2">
                  {contact.hoverContent.icon}
                  <div>
                    <strong>{contact.hoverContent.title} </strong>
                    <span>{contact.hoverContent.subtitle}</span>
                  </div>
                </div>
              </Link>
            </HoverCardContent>
          </HoverCard>
        )
      }

      return (
        <Link
          key={contact.id}
          className="hover:underline hover:decoration-slate-300 hover:decoration-wavy hover:decoration-1 hover:underline-offset-4"
          href={contact.url}
          target="_blank"
        >
          {contact.label}
        </Link>
      )
    })
  }

  return (
    <div className="m-auto flex min-h-screen flex-col gap-8 text-sm text-foreground">
      <header className="flex flex-col gap-3">
        <h1
          className="mb-2 inline-flex gap-2 text-2xl font-bold"
          style={{ fontFamily: 'var(--font-lora)' }}
        >
          <span>{personal.name}</span>
          <Separator orientation="vertical" />
          <span className="text-red-500">{personal.title}</span>
        </h1>

        <InlineLink links={renderContactLinks()} />

        <Overview className="text-sm">
          Data Engineer with 6+ years of experience in modern data warehousing,
          distributed systems, and cloud computing. Proficient in{' '}
          <Skill skill="LlamaIndex" url="https://www.llamaindex.ai/" />
          {', '}
          <Skill skill="AI SDK" url="https://ai-sdk.dev/" />
          {', '}
          <SkillClickHouse />
          {', '}
          <SkillSpark />
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
          {experience.map((exp) => (
            <ExperienceItem
              key={exp.id}
              title={exp.title}
              company={exp.company}
              companyUrl={exp.companyUrl}
              companyLogo={exp.companyLogo}
              companyLogoClassName={exp.companyLogoClassName}
              from={exp.from}
              to={exp.to}
              responsibilities={exp.responsibilities}
            />
          ))}
        </div>
      </Section>

      <Section title="Education">
        {education.map((edu) => (
          <Education
            key={edu.id}
            major={edu.major}
            thesis={edu.thesis}
            thesisUrl={edu.thesisUrl}
            university={edu.university}
            period={edu.period}
          />
        ))}
      </Section>

      <Section title="Skills">
        <div className="flex flex-col gap-2">
          <div>
            <strong>Data Engineering:</strong>{' '}
            <Skill skill="LlamaIndex" url="https://www.llamaindex.ai/" />
            {', '}
            <Skill skill="AI SDK" url="https://ai-sdk.dev/" />
            {', '}
            <SkillClickHouse />
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

      <footer className="cv-print-footer hidden print:block">
        <Separator className="cv-footer-separator my-2" />
        <p className="text-xs text-muted-foreground">
          Live version at{' '}
          <Link
            href="https://duyet.net/cv"
            className="underline"
            target="_blank"
          >
            https://duyet.net/cv
          </Link>
        </p>
      </footer>
    </div>
  )
}
