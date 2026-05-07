import { Separator } from "@duyet/components/ui/separator";
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
    <div className="m-auto flex min-h-screen flex-col gap-0 text-[15px] text-foreground">
      <Profile personal={personal} />

      <Section title="Experience">
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

      <footer className="cv-print-footer hidden print:block mt-6">
        <p className="text-[8px] text-neutral-400">
          Live version at{" "}
          <a
            href="https://cv.duyet.net"
            className="underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            https://cv.duyet.net
          </a>
        </p>
      </footer>
    </div>
  );
}
