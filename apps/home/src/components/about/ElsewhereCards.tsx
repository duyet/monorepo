import { ArrowUpRight } from "lucide-react";
import { SoftLabel } from "../SoftLabel";
import { SectionHead } from "../SectionHead";

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
    <div>
      <SectionHead eyebrow="Network" title="Elsewhere" />
      <div className="home-about-elsewhere">
        {elsewhere.map((e) => (
          <a
            key={e.title}
            className="home-proj-card home-about-elsewhere-card no-underline text-inherit"
            href={e.url}
            target="_blank"
            rel="noreferrer"
          >
            <div className="flex items-center justify-between gap-3">
              <SoftLabel tone="slate">{e.title}</SoftLabel>
              <span className="text-[var(--rd-text-3)]" aria-hidden="true">
                <ArrowUpRight size={15} />
              </span>
            </div>
            <p className="home-cap-body mt-3">{e.description}</p>
          </a>
        ))}
      </div>
    </div>
  );
}

export { ElsewhereCards };
