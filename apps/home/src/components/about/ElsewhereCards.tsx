import { ArrowUpRight } from "lucide-react";
import { SectionHead } from "../SectionHead";

interface ElsewhereLink {
  title: string;
  description: string;
  url: string;
}

function ElsewhereCards({ elsewhere }: { elsewhere: ElsewhereLink[] }) {
  return (
    <div>
      <SectionHead title="Elsewhere" />
      <ul className="m-0 grid list-none grid-cols-1 gap-x-6 gap-y-3.5 p-0 min-[640px]:grid-cols-2 min-[900px]:grid-cols-4">
        {elsewhere.map((e) => (
          <li key={e.title}>
            <a
              className="flex min-w-0 flex-col gap-0.5 text-inherit no-underline"
              href={e.url}
              target="_blank"
              rel="noreferrer"
            >
              <span className="inline-flex items-center gap-1 text-[0.9375rem] font-medium tracking-[-0.02em]">
                {e.title}
                <ArrowUpRight size={13} />
              </span>
              <span className="text-[0.8rem] leading-[1.4] text-[var(--rd-text-3)]">
                {e.description}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export { ElsewhereCards };
