import { Separator } from "@duyet/components/ui/separator";
import Link from "next/link";
import { Education } from "@/components/education";
import { ExperienceItem } from "@/components/experience";
import { Profile } from "@/components/profile";
import { Section } from "@/components/section";
import { SkillsSection } from "@/components/skills-section";

import { cvData } from "@/config/cv.data";

export const dynamic = "force-static";

export default function Page() {
  const { personal, experience, education } = cvData;

  return (
    <div className="m-auto flex min-h-screen flex-col gap-6 text-sm text-foreground">
      <Profile personal={personal} />

      <Section title="Experience">
        <div className="flex flex-col gap-4">
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

      <SkillsSection />

      <footer className="cv-print-footer hidden print:block">
        <Separator className="cv-footer-separator my-2" />
        <p className="text-xs text-muted-foreground">
          Live version at{" "}
          <Link
            href="https://duyet.net/cv"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://duyet.net/cv
          </Link>
        </p>
      </footer>
    </div>
  );
}
