import type { AppItem } from "../data/projects";

function initials(name: string): string {
  const words = name
    .replace(/npx skills add /i, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }
  return (words[0] ?? name).slice(0, 2).toUpperCase();
}

function toneHex(item: AppItem): string {
  return (
    item.workTone ??
    item.tone?.match(/#[0-9a-fA-F]{3,8}/)?.[0] ??
    "#536f91"
  );
}

export function ProjectMark({
  item,
  size = 28,
  className,
  generated = false,
}: {
  item: AppItem;
  size?: number;
  className?: string;
  generated?: boolean;
}) {
  if (!generated && (item.logo || item.logoDark)) {
    const light = item.logo || item.logoDark;
    const dark = item.logoDark || item.logo;
    return (
      <span
        className={className}
        style={{ width: size, height: size }}
        aria-hidden="true"
      >
        {item.logoDark ? (
          <>
            <img
              src={light}
              alt=""
              width={size}
              height={size}
              data-theme-logo="light"
              className="h-full w-full object-contain"
            />
            <img
              src={dark}
              alt=""
              width={size}
              height={size}
              data-theme-logo="dark"
              className="h-full w-full object-contain"
            />
          </>
        ) : (
          <img
            src={light}
            alt=""
            width={size}
            height={size}
            data-theme-logo={
              /blk|black|logo-blk|build-agent/i.test(light ?? "")
                ? "mono"
                : undefined
            }
            className="h-full w-full object-contain"
          />
        )}
      </span>
    );
  }

  const letters = initials(item.name);
  const bg = toneHex(item);

  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="7" fill={bg} />
      <text
        x="16"
        y="21"
        textAnchor="middle"
        fill="#fff"
        fontSize={letters.length > 1 ? 12 : 14}
        fontWeight="600"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
      >
        {letters}
      </text>
    </svg>
  );
}
