import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Layers, AlignJustify } from "lucide-react";
import { addUtmParams } from "../../app/lib/utm";
import { apps, type AppItem } from "../data/projects";
import { SecHead, Reveal } from "@duyet/components";

export const Route = createFileRoute("/projects")({
  component: ProjectsPage,
  head: () => ({
    meta: [
      { title: "Projects | Duyet Le" },
      {
        name: "description",
        content:
          "A complete list of Duyet Le projects, apps, dashboards, AI tools, and open source work.",
      },
    ],
  }),
});

// ---------------------------------------------------------------------------
// Category derivation — "Live" vs "OSS" based on host
// ---------------------------------------------------------------------------

type Category = "All" | "Live" | "OSS";

function categoryOf(item: AppItem): Omit<Category, "All"> {
  return item.host === "github.com" ? "OSS" : "Live";
}

const CATEGORIES: Category[] = ["All", "Live", "OSS"];

const liveCount = apps.filter((a) => a.host !== "github.com").length;

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

function ProjectsPage() {
  const [filter, setFilter] = useState<Category>("All");
  const [view, setView] = useState<"grid" | "list">("grid");

  const list =
    filter === "All" ? apps : apps.filter((a) => categoryOf(a) === filter);

  return (
    <div style={{ background: "var(--rd-bg)", color: "var(--rd-text)" }}>
      <section
        className="rd-wrap"
        style={{
          paddingTop: "clamp(44px, 6vw, 76px)",
          paddingBottom: "clamp(56px, 8vw, 96px)",
        }}
      >
        <Reveal>
          <SecHead
            eyebrow={`Projects · ${apps.length} total`}
            title="Everything I've built & kept running."
            links={[
              {
                label: "GitHub",
                href: "https://github.com/duyet",
              },
            ]}
          />
          <p
            className="rd-lead"
            style={{ marginTop: 16, maxWidth: "60ch" }}
          >
            Products, small tools, and open source — most of it live on a
            subdomain or a GitHub repo. {liveCount} are running right now.
          </p>
        </Reveal>

        {/* filter + view toggle toolbar */}
        <Reveal delay={60}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 16,
              flexWrap: "wrap",
              marginTop: 32,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`rd-chip-btn rd-mono${filter === cat ? " rd-on" : ""}`}
                  onClick={() => setFilter(cat)}
                  style={{ fontSize: 13, cursor: "pointer" }}
                >
                  {cat}
                </button>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setView("grid")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  border: "1px solid",
                  borderColor:
                    view === "grid"
                      ? "var(--rd-text)"
                      : "var(--rd-border)",
                  borderRadius: "var(--rd-r-sm)",
                  background: "transparent",
                  color:
                    view === "grid"
                      ? "var(--rd-text)"
                      : "var(--rd-text-3)",
                  cursor: "pointer",
                }}
              >
                <Layers size={15} />
              </button>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setView("list")}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 32,
                  height: 32,
                  border: "1px solid",
                  borderColor:
                    view === "list"
                      ? "var(--rd-text)"
                      : "var(--rd-border)",
                  borderRadius: "var(--rd-r-sm)",
                  background: "transparent",
                  color:
                    view === "list"
                      ? "var(--rd-text)"
                      : "var(--rd-text-3)",
                  cursor: "pointer",
                }}
              >
                <AlignJustify size={15} />
              </button>
            </div>
          </div>
        </Reveal>

        {view === "grid" ? (
          <ProjectGrid items={list} />
        ) : (
          <ProjectList items={list} />
        )}
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Grid view — rd-work-grid / rd-work-card pattern
// ---------------------------------------------------------------------------

function ProjectGrid({ items }: { items: AppItem[] }) {
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

        return (
          <Reveal key={item.name} delay={i * 25}>
            {isExternal ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="rd-card rd-card-hover rd-work-card"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
                <WorkCardBody item={item} cat={String(cat)} />
              </a>
            ) : (
              <Link
                to={href}
                className="rd-card rd-card-hover rd-work-card"
                style={{
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  flexDirection: "column",
                  height: "100%",
                }}
              >
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
      <div className="rd-work-top">
        <span className="rd-mono rd-work-dom">
          {item.domain || item.host}
        </span>
      </div>
      <h3 className="rd-work-name">{item.name}</h3>
      <p className="rd-work-desc">{item.description}</p>
      <div className="rd-work-foot">
        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
          {item.tags?.map((tag) => (
            <span key={tag} className="rd-chip rd-mono rd-work-tag">{tag}</span>
          ))}
          <span className="rd-chip rd-mono rd-work-tag">{cat}</span>
        </div>
        <span style={{ color: "var(--rd-text-4)" }}>
          <ArrowUpRight size={15} />
        </span>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// List view — rd-rows / rd-row pattern
// ---------------------------------------------------------------------------

function ProjectList({ items }: { items: AppItem[] }) {
  return (
    <div className="rd-rows">
      {items.map((item) => {
        const href = addUtmParams(
          item.href,
          "projects",
          item.utmContent,
          item.host,
        );
        const isExternal = href.startsWith("http");
        const inner = (
          <>
            <span
              className="rd-mono rd-dim"
              style={{
                fontSize: 12.5,
                width: 200,
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                flexShrink: 0,
              }}
            >
              {item.domain || item.host}
            </span>
            <span style={{ minWidth: 0, flex: 1 }}>
              <span
                style={{
                  fontWeight: 600,
                  marginRight: 12,
                  letterSpacing: "-0.02em",
                }}
              >
                {item.name}
              </span>
              <span
                className="rd-muted"
                style={{ fontSize: 14 }}
              >
                {item.description}
              </span>
            </span>
            <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
              {item.tags?.map((tag) => (
                <span key={tag} className="rd-chip rd-mono" style={{ fontSize: 10.5 }}>{tag}</span>
              ))}
            </div>
          </>
        );

        const rowStyle = {
          display: "flex",
          alignItems: "center",
          gap: 16,
          textDecoration: "none",
          color: "inherit",
          cursor: "pointer",
        } as const;

        return isExternal ? (
          <a
            key={item.name}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="rd-row"
            style={rowStyle}
          >
            {inner}
          </a>
        ) : (
          <Link
            key={item.name}
            to={href}
            className="rd-row"
            style={rowStyle}
          >
            {inner}
          </Link>
        );
      })}
    </div>
  );
}
