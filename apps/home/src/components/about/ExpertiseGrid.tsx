import { Reveal } from "@duyet/components";
import { SoftLabel, toneFrom } from "../SoftLabel";
import { SectionHead } from "../SectionHead";

interface ExpertiseItem {
  area: string;
  yr: string;
  desc: string;
  tools: string[];
}

interface ExpertiseGridProps {
  expertise: ExpertiseItem[];
  experienceYears: string;
}

function ExpertiseGrid({ expertise, experienceYears }: ExpertiseGridProps) {
  return (
    <div>
      <SectionHead eyebrow="Capabilities" title="Areas of expertise" />
      <p className="home-about-expertise-lead">
        {experienceYears} of delivery across data, AI, and platform engineering —
        here&apos;s where the time actually went.
      </p>
      <div className="home-about-expertise">
        {expertise.map((e, i) => (
          <Reveal
            key={e.area}
            delay={i * 50}
            className="home-cap-card home-about-expertise-card"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="home-sec-title text-[clamp(1.2rem,2vw,1.45rem)] mt-0">
                {e.area}
              </h3>
              <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[12.5px] shrink-0">
                {e.yr}
              </span>
            </div>
            <p className="home-cap-body flex-1">{e.desc}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {e.tools.map((t) => (
                <SoftLabel key={t} tone={toneFrom(t)}>
                  {t}
                </SoftLabel>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export { ExpertiseGrid };
