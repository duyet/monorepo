import {
  ArrowUpRight,
  BarChart2,
  BookOpen,
  Bot,
  BrainCircuit,
  Cloud,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Globe,
  Link as LinkIcon,
  type LucideIcon,
  Package,
  Play,
  Plug,
  Puzzle,
  Rss,
  Share2,
  Shield,
  ShoppingCart,
  Terminal,
  Type,
  X,
} from "lucide-react";
import { type CSSProperties, useState } from "react";
import { addUtmParams } from "../../app/lib/utm";
import { artFor } from "../data/ascii-art";
import type { AppItem } from "../data/projects";
import { ProjectBlogLinks } from "./ProjectBlogLinks";
import { SoftLabel, toneFrom } from "./SoftLabel";

interface WorkBentoProps {
  selectedProjects: { item: AppItem; tag: string }[];
}

const ICONS: Record<string, LucideIcon> = {
  BarChart2,
  BookOpen,
  Bot,
  BrainCircuit,
  Cloud,
  Code2,
  Cpu,
  Database,
  GitBranch,
  Globe,
  Link: LinkIcon,
  Package,
  Plug,
  Puzzle,
  Rss,
  Share2,
  Shield,
  ShoppingCart,
  Terminal,
  Type,
};

const FALLBACK_ART = [
  "#536f91",
  "#8b633f",
  "#5f6257",
  "#7f524e",
  "#6a5578",
  "#3d5a4c",
  "#4a5568",
  "#5c4a3a",
  "#2f4a5e",
  "#6b4f3a",
];

function artColor(item: AppItem, seed: string): string {
  const fromTone = item.tone?.match(/#([0-9a-fA-F]{3,8})/)?.[0];
  if (fromTone) return fromTone;
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash + seed.charCodeAt(i) * (i + 1)) % 97;
  }
  return FALLBACK_ART[hash % FALLBACK_ART.length];
}

function ArtVisual({ item }: { item: AppItem }) {
  const [playing, setPlaying] = useState(false);
  const Icon = (item.iconName && ICONS[item.iconName]) || Globe;
  const logo = item.logoDark || item.logo;

  if (item.youtubeId) {
    if (playing) {
      return (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1`}
          title={item.name}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="home-ship-frame"
        />
      );
    }
    return (
      <button
        type="button"
        className="home-ship-play"
        aria-label={`Play the ${item.name} video`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setPlaying(true);
        }}
      >
        <img
          src={`https://i.ytimg.com/vi/${item.youtubeId}/hqdefault.jpg`}
          alt=""
          className="home-ship-shot"
          loading="lazy"
        />
        <span className="home-ship-play-btn">
          <Play size={16} fill="currentColor" className="ml-0.5" />
        </span>
      </button>
    );
  }

  if (item.screenshot) {
    return (
      <div className="home-ship-visual">
        <img
          src={item.screenshot}
          alt=""
          className="home-ship-shot"
          loading="lazy"
        />
        {logo ? (
          <img src={logo} alt="" className="home-ship-badge-logo" loading="lazy" />
        ) : (
          <span className="home-ship-badge-icon" aria-hidden="true">
            <Icon size={18} strokeWidth={1.5} />
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="home-ship-visual">
      <img
        src={artFor(item.name, 3)}
        alt=""
        className="home-ship-shot"
        loading="lazy"
      />
      {logo ? (
        <img src={logo} alt="" className="home-ship-badge-logo" loading="lazy" />
      ) : (
        <span className="home-ship-badge-icon" aria-hidden="true">
          <Icon size={18} strokeWidth={1.5} />
        </span>
      )}
    </div>
  );
}

export function WorkBento({ selectedProjects }: WorkBentoProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="home-ship-grid">
      {selectedProjects.map(({ item, tag }) => {
        const isOpen = expanded === item.name;
        const href = addUtmParams(
          item.href,
          "homepage",
          item.utmContent,
          item.host
        );
        const color = artColor(item, item.name);
        const tags = item.tags?.length ? item.tags : [tag];

        return (
          <article
            key={item.name}
            className={`home-ship-card ${isOpen ? "is-open" : ""}`}
            style={{ "--ship-art": color } as CSSProperties}
          >
            <button
              type="button"
              className="home-ship-hit"
              aria-expanded={isOpen}
              aria-label={
                isOpen ? `Collapse ${item.name}` : `Expand ${item.name}`
              }
              onClick={() => setExpanded(isOpen ? null : item.name)}
            />

            <div className="home-ship-body">
              <div className="home-ship-copy">
                <SoftLabel tone={toneFrom(tag)}>{tag}</SoftLabel>
                <h3 className="home-ship-title">{item.name}</h3>
                <p className="home-ship-desc">{item.description}</p>
                <div className="home-ship-actions">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="home-text-link relative z-10"
                  >
                    {item.domain || item.host}
                    <ArrowUpRight size={13} />
                  </a>
                </div>
              </div>

              <div className="home-ship-art" aria-hidden={!item.screenshot}>
                <div className="home-ship-grain" />
                <ArtVisual item={item} />
              </div>
            </div>

            {isOpen ? (
              <div className="home-ship-detail">
                <div className="flex flex-wrap gap-1.5">
                  {tags.map((t) => (
                    <SoftLabel key={t} tone={toneFrom(t)}>
                      {t}
                    </SoftLabel>
                  ))}
                </div>
                <ProjectBlogLinks
                  slugs={item.blogPosts}
                  heading="Related"
                  className="home-related"
                  linkClassName="home-text-link text-[13px]"
                  iconSize={11}
                />
                <div className="mt-3 flex flex-wrap gap-2">
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rd-btn rd-btn-primary no-underline text-[13px] px-4 py-2.5 relative z-10"
                  >
                    Visit project
                  </a>
                  <button
                    type="button"
                    className="rd-btn rd-btn-ghost text-[13px] px-4 py-2.5 relative z-10"
                    onClick={() => setExpanded(null)}
                  >
                    Close <X size={13} />
                  </button>
                </div>
              </div>
            ) : null}
          </article>
        );
      })}
    </div>
  );
}
