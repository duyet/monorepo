import { SoftLabel, toneFrom } from "../SoftLabel";
import { SectionHead } from "../SectionHead";
import { StackGroupIcon } from "./StackGroupIcon";

interface TechStackGroup {
  g: string;
  icon: string;
  items: string[];
}

interface TechStackGridProps {
  techStack: TechStackGroup[];
}

function TechStackGrid({ techStack }: TechStackGridProps) {
  return (
    <div>
      <SectionHead eyebrow="Toolkit" title="What I reach for" />
      <div className="home-about-stack">
        {techStack.map((group) => (
          <article key={group.g} className="home-cap-card">
            <div className="mb-3.5 flex items-center gap-2.5">
              <span className="home-cap-icon mb-0" aria-hidden="true">
                <StackGroupIcon icon={group.icon} />
              </span>
              <h3 className="home-cap-title mt-0">{group.g}</h3>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {group.items.map((item) => (
                <SoftLabel key={item} tone={toneFrom(item)}>
                  {item}
                </SoftLabel>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export { TechStackGrid };
