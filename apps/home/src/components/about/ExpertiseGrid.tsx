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
      <p className="m-0 mb-5 max-w-[46rem] text-[0.95rem] leading-[1.6] text-[var(--rd-text-2)]">
        {experienceYears} of delivery across data, AI, and platform engineering —
        here&apos;s where the time actually went.
      </p>
      <div className="grid gap-4 min-[720px]:grid-cols-2">
        {expertise.map((e, i) => (
          <Reveal
            key={e.area}
            delay={i * 50}
            className="flex flex-col rounded-[var(--rd-r-lg)] border border-[var(--rd-border)] bg-[var(--rd-surface)] p-5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <h3 className="m-0 font-[family-name:var(--font-display)] text-[clamp(1.2rem,2vw,1.45rem)] font-normal tracking-[-0.03em]">
                {e.area}
              </h3>
              <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[12.5px] shrink-0">
                {e.yr}
              </span>
            </div>
            <p className="mt-2 mb-0 flex-1 text-[0.9rem] leading-[1.55] text-[var(--rd-text-2)]">
              {e.desc}
            </p>
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
