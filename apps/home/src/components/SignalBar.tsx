import { Sparkline } from "@duyet/components";
import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";
import { cn } from "../lib/utils";

interface SignalBarProps {
  totalPosts: number;
  yearsWriting: number;
  sinceYear: number;
  projectCount: number;
  siblingAppCount: number;
  homelabSummary: {
    nodesOnline: number;
    nodesTotal: number;
    services: number;
    avgCpu: number;
  };
  codingSparkline: number[];
  tokenBurn: string;
}

export function SignalBar({
  totalPosts,
  yearsWriting,
  sinceYear,
  projectCount,
  siblingAppCount,
  homelabSummary: h,
  codingSparkline,
  tokenBurn,
}: SignalBarProps) {
  const tiles = [
    {
      k: "Writing",
      big: String(totalPosts),
      unit: "posts",
      sub: `${yearsWriting} years, since ${sinceYear}`,
      to: "https://blog.duyet.net",
    },
    {
      k: "Shipping",
      big: String(projectCount),
      unit: "projects",
      sub: `${siblingAppCount} live apps`,
      to: "/projects",
    },
    {
      k: "Token burn",
      big: tokenBurn,
      unit: "",
      sub: "all-time agent burn",
      flame: true,
      to: "https://burn.duyet.net",
    },
    {
      k: "Cluster",
      big: `${h.nodesOnline}/${h.nodesTotal}`,
      unit: "online",
      sub: `${h.services} services · ${h.avgCpu}% CPU`,
      live: true,
      to: "https://homelab.duyet.net",
    },
    {
      k: "Coding",
      big: "326",
      unit: "h/30d",
      sub: "11h avg / active day",
      spark: codingSparkline,
      to: "https://insights.duyet.net",
    },
  ];

  return (
    <div className="signalbar">
      {tiles.map((t) => {
        const isExternal = t.to.startsWith("http");
        const Component = isExternal ? "a" : Link;
        const linkProps = isExternal
          ? { href: t.to, target: "_blank", rel: "noreferrer" }
          : { to: t.to };

        return (
          <Component
            key={t.k}
            {...linkProps}
            className="signal-tile flex min-w-0 cursor-pointer flex-col gap-2 border-none bg-[var(--rd-surface)] p-[18px_20px] text-left text-inherit no-underline"
          >
            <div className="rd-eyebrow flex items-center gap-1.5 text-[10.5px]">
              {t.live && (
                <span className="rd-dot rd-ok rd-pulse inline-block" />
              )}
              {t.flame && (
                <span className="inline-flex text-[var(--rd-accent)]">
                  <Flame size={12} fill="var(--rd-accent)" />
                </span>
              )}
              {t.k}
            </div>
            <div
              className={cn(
                "text-[clamp(2rem,4vw,2.9rem)] font-semibold tracking-[-0.04em] leading-none text-[1.9rem]",
                t.flame && "text-[var(--rd-accent-ink)]"
              )}
            >
              {t.big}
              <span className="rd-unit">{t.unit}</span>
            </div>
            {t.spark ? (
              <Sparkline data={t.spark} h={22} />
            ) : (
              <div className="h-[22px]" />
            )}
            <div className="font-[var(--font-mono)] text-[var(--rd-text-3)] overflow-hidden text-ellipsis whitespace-nowrap text-[11px]">
              {t.sub}
            </div>
          </Component>
        );
      })}
    </div>
  );
}
