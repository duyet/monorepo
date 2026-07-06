import { Reveal, SecHead } from "@duyet/components";
import { Badge } from "../ui/badge";

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
    <div className="mt-[clamp(48px,6vw,72px)]">
      <SecHead
        eyebrow="Capabilities"
        title="Areas of expertise"
        links={[{ label: "See projects", href: "/projects" }]}
      />
      <p className="text-[var(--rd-text-2)] -mt-4 mb-[26px] max-w-[52ch]">
        {experienceYears} of delivery across data, AI, and platform engineering
        — here's where the time actually went.
      </p>
      <div className="rd-g2 gap-3">
        {expertise.map((e, i) => (
          <Reveal
            key={e.area}
            delay={i * 50}
            className="rd-card p-[clamp(18px,2.2vw,26px)] flex flex-col p-[clamp(22px,2.6vw,30px)]"
          >
            <div className="flex items-baseline justify-between">
              <h3 className="text-[1.35rem] tracking-[-0.03em]">{e.area}</h3>
              <span className="font-[var(--font-mono)] text-[var(--rd-text-3)] text-[12.5px]">
                {e.yr}
              </span>
            </div>
            <p className="text-[var(--rd-text-2)] mt-3 flex-1 text-[14.5px] leading-[1.55]">
              {e.desc}
            </p>
            <div className="mt-[18px] flex flex-wrap gap-[7px]">
              {e.tools.map((t) => (
                <Badge
                  key={t}
                  variant="outline"
                  className="font-[var(--font-mono)] text-[11.5px] px-2 py-0"
                >
                  {t}
                </Badge>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

export { ExpertiseGrid };
