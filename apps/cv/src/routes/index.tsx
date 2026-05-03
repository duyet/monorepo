import { createFileRoute } from "@tanstack/react-router";
import { Education } from "@/components/education";
import { ExperienceItem } from "@/components/experience";
import { Profile } from "@/components/profile";
import { Section } from "@/components/section";
import { SkillsSection } from "@/components/skills-section";

import { cvData } from "@/config/cv.data";

export const Route = createFileRoute("/")({
  component: Page,
});

function Page() {
  const { personal, experience, education } = cvData;

  return (
    <div className="m-auto flex min-h-screen flex-col gap-9 text-sm text-foreground print:min-h-0 print:gap-2 print:text-black">
      <Profile personal={personal} />

      <Section title="Experience">
        <div className="flex flex-col gap-5 print:gap-1.5">
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

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.4fr]">
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
      </div>
    </div>
  );
}
