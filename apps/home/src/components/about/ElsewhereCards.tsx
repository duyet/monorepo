import { Eyebrow } from "@duyet/components";
import { ArrowUpRight } from "lucide-react";

interface ElsewhereLink {
  title: string;
  description: string;
  url: string;
}

interface ElsewhereCardsProps {
  elsewhere: ElsewhereLink[];
}

function ElsewhereCards({ elsewhere }: ElsewhereCardsProps) {
  return (
    <div className="mt-[clamp(48px,6vw,72px)]">
      <Eyebrow>Elsewhere</Eyebrow>
      <div className="rd-g4 mt-[18px] gap-[10px]">
        {elsewhere.map((e) => (
          <a
            key={e.title}
            className="rd-card p-[clamp(18px,2.2vw,26px)] flex flex-col gap-2 bg-[var(--rd-bg-sub)] min-h-[120px] text-inherit no-underline"
            href={e.url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center justify-between">
              <span className="text-[16px] font-semibold">{e.title}</span>
              <span className="rd-rowarrow">
                <ArrowUpRight size={15} />
              </span>
            </div>
            <p className="text-[var(--rd-text-2)] text-[13.5px] leading-[1.5]">
              {e.description}
            </p>
          </a>
        ))}
      </div>
    </div>
  );
}

export { ElsewhereCards };
