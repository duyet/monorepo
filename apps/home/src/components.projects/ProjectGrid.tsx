import { Link } from "@tanstack/react-router";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@duyet/components";
import { type AppItem } from "../data/projects";
import { addUtmParams } from "../../app/lib/utm";
import { Badge } from "../components/ui/badge";
import { categoryOf } from "./filter-utils";
import { ColoredDomain } from "./ColoredDomain";

export function ProjectGrid({ items }: { items: AppItem[] }) {
  return (
    <div className="rd-work-grid">
      {items.map((item, i) => {
        const href = addUtmParams(
          item.href,
          "projects",
          item.utmContent,
          item.host,
        );
        const cat = categoryOf(item);
        const isExternal = href.startsWith("http");

        const cardClass =
          "rd-card flex flex-col p-5 min-h-[176px] no-underline text-inherit h-full";

        return (
          <Reveal key={item.name} delay={i * 25}>
            {isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className={cardClass}
              >
                <WorkCardBody item={item} cat={String(cat)} />
              </a>
            ) : (
              <Link to={href} className={cardClass}>
                <WorkCardBody item={item} cat={String(cat)} />
              </Link>
            )}
          </Reveal>
        );
      })}
    </div>
  );
}

function WorkCardBody({ item, cat }: { item: AppItem; cat: string }) {
  return (
    <>
      <div className={item.logo ? "grid grid-cols-[auto_1fr] gap-x-3 items-center" : ""}>
        {item.logo && (
          <img
            src={item.logo}
            alt=""
            className="shrink-0 rounded row-span-2 self-start w-[50px] h-auto max-h-[50px] object-contain"
          />
        )}
        <span className="font-[var(--font-mono)] text-[11px]">
          <ColoredDomain domain={item.domain || item.host} />
        </span>
        <h3 className="text-[1.18rem] tracking-[-0.03em] mt-0.5 leading-tight">{item.name}</h3>
      </div>
      <p className="rd-work-desc">{item.description}</p>
      <div className="flex items-center justify-between mt-4">
        <div className="flex gap-1 flex-wrap">
          {item.tags?.map((tag) => (
            <Badge key={tag} variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">{tag}</Badge>
          ))}
          <Badge variant="outline" className="font-[var(--font-mono)] text-[10.5px] px-2 py-0">{cat}</Badge>
        </div>
        <span className="text-[var(--rd-text-4)]">
          <ArrowUpRight size={15} />
        </span>
      </div>
    </>
  );
}
