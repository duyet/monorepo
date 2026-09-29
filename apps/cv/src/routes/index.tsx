import { Separator } from "@duyet/components/ui/separator";
import { createFileRoute } from "@tanstack/react-router";
import { ogHeadLinks } from "@duyet/config/og";
import { Education } from "@/components/education";
import { ExperienceItem } from "@/components/experience";
import { Profile } from "@/components/profile";
import { Section } from "@/components/section";
import { SkillsSection } from "@/components/skills-section";

import { cvData } from "@/config/cv.data";

export const Route = createFileRoute("/")({
  // Title, description and the full OG/Twitter set come from the root route,
  // which already targets this URL. This route only contributes the canonical:
  // TanStack Start concatenates `links` across the matched route chain without
  // deduplicating, so a root-level canonical would emit a second one on /pdf.
  head: () => ({
    links: ogHeadLinks({ url: "https://cv.duyet.net" }),
  }),
  component: Page,
});

function Page() {
  const { personal, experience, education } = cvData;

  return (
    <div className="m-auto flex min-h-screen flex-col gap-0 text-[15px] text-foreground">
      <Profile personal={personal} />

      <Section title="Education">
        {education.map((edu) => (
            <Education
              key={edu.id}
              major={edu.major}
              thesisUrl={edu.thesisUrl}
              university={edu.university}
              period={edu.period}
            />
        ))}
      </Section>

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

      <SkillsSection />

      <footer className="cv-print-footer hidden print:block">
        <Separator className="cv-footer-separator my-2" />
        <p className="text-xs text-muted-foreground">
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
