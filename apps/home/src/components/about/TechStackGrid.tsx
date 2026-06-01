import { Badge } from "../ui/badge";
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
    <div className="rd-g4 mt-3 gap-[10px]">
      {techStack.map((group) => (
        <div
          key={group.g}
          className="rd-card p-[clamp(18px,2.2vw,26px)] px-[22px] py-5"
        >
          <div className="mb-[14px] flex items-center gap-[10px]">
            <div className="rd-stack-ic">
              <StackGroupIcon icon={group.icon} />
            </div>
            <span className="text-[14px] font-semibold tracking-[-0.01em]">
              {group.g}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {group.items.map((item) => (
              <Badge
                key={item}
                variant="outline"
                className="font-[var(--font-mono)] text-[11.5px] px-2 py-0"
              >
                {item}
              </Badge>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export { TechStackGrid };
