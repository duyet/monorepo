import { cn } from "@duyet/libs/utils";
import { useEffect, useMemo, useState } from "react";
import { CATEGORY_ORDER, type Category } from "../../app/config/categories";

type ViewMode = "list" | "grid";

interface UrlEntry {
  path: string;
  target: string;
  desc?: string;
  category?: Category;
}

function ListIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}

function GridIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
    </svg>
  );
}

function ExternalIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
    </svg>
  );
}

const surfaceCard = "#efe9de";
const canvas = "#faf9f5";
const ink = "#141413";
const muted = "#6c6a64";
const mutedSoft = "#8e8b82";
const hairline = "#e6dfd8";

function UrlCard({ path, target, desc }: UrlEntry) {
  const isExternal = target.startsWith("http");
  return (
    <a
      href={target}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 8,
        background: surfaceCard,
        padding: 20,
        borderRadius: 8,
        textDecoration: "none",
        color: ink,
        transition: "transform 0.15s ease",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <code style={{ fontFamily: "monospace", fontSize: 15, fontWeight: 600, color: ink }}>
          {path}
        </code>
        {isExternal && <ExternalIcon style={{ width: 14, height: 14, color: mutedSoft, flexShrink: 0 }} />}
      </div>
      {desc ? (
        <p style={{ fontSize: 13, color: muted, lineHeight: 1.4, margin: 0 }}>{desc}</p>
      ) : (
        <p style={{ fontSize: 13, color: mutedSoft }}>—</p>
      )}
      <p style={{ fontFamily: "monospace", fontSize: 11, color: mutedSoft, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
        {target}
      </p>
    </a>
  );
}

function CategoryHeader({ category, count }: { category: string; count: number }) {
  return (
    <div style={{ marginBottom: 12, display: "flex", alignItems: "center", gap: 12 }}>
      <h2 style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", color: mutedSoft, margin: 0 }}>
        {category}
      </h2>
      <div style={{ flex: 1, borderTop: `1px solid ${hairline}` }} />
      <span style={{ fontSize: 11, color: mutedSoft }}>{count}</span>
    </div>
  );
}

export default function UrlsList({ urls }: { urls: UrlEntry[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [view, setView] = useState<ViewMode>("list");

  useEffect(() => {
    const saved = localStorage.getItem("ls-view") as ViewMode | null;
    if (saved === "list" || saved === "grid") setView(saved);
  }, []);

  function setViewAndSave(v: ViewMode) {
    setView(v);
    localStorage.setItem("ls-view", v);
  }

  const filteredUrls = useMemo(() => {
    if (!searchQuery) return urls;
    const query = searchQuery.toLowerCase();
    return urls.filter(
      ({ path, target, desc }) =>
        path.toLowerCase().includes(query) ||
        target.toLowerCase().includes(query) ||
        desc?.toLowerCase().includes(query)
    );
  }, [searchQuery, urls]);

  const grouped = useMemo(() => {
    const map = new Map<string, UrlEntry[]>();
    for (const entry of filteredUrls) {
      const cat = entry.category ?? "Other";
      if (!map.has(cat)) map.set(cat, []);
      map.get(cat)!.push(entry);
    }
    const sorted = new Map<string, UrlEntry[]>();
    for (const key of CATEGORY_ORDER) {
      if (map.has(key)) sorted.set(key, map.get(key)!);
    }
    map.forEach((entries, key) => {
      if (!sorted.has(key)) sorted.set(key, entries);
    });
    return sorted;
  }, [filteredUrls]);

  return (
    <>
      {/* Search + Toggle */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            aria-label="Search by path, URL, or description"
            placeholder="Search by path, URL, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "14px 100px 14px 44px",
              fontSize: 14,
              background: canvas,
              color: ink,
              border: `1px solid ${hairline}`,
              borderRadius: 8,
              outline: "none",
              fontFamily: "inherit",
            }}
          />
          <svg
            aria-hidden="true"
            style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", width: 18, height: 18, color: mutedSoft }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <div style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", gap: 4 }}>
            {searchQuery && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setSearchQuery("")}
                style={{ background: "none", border: "none", padding: 4, color: mutedSoft, cursor: "pointer" }}
              >
                <svg aria-hidden="true" style={{ width: 16, height: 16 }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <div style={{ display: "flex", background: surfaceCard, borderRadius: 6, padding: 2 }}>
              <button
                type="button"
                aria-label="List view"
                onClick={() => setViewAndSave("list")}
                style={{
                  padding: 5,
                  borderRadius: 4,
                  border: "none",
                  background: view === "list" ? canvas : "transparent",
                  color: view === "list" ? ink : mutedSoft,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                <ListIcon style={{ width: 16, height: 16 }} />
              </button>
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setViewAndSave("grid")}
                style={{
                  padding: 5,
                  borderRadius: 4,
                  border: "none",
                  background: view === "grid" ? canvas : "transparent",
                  color: view === "grid" ? ink : mutedSoft,
                  cursor: "pointer",
                  transition: "background 0.15s",
                }}
              >
                <GridIcon style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10, fontSize: 13, color: muted }}>
          {filteredUrls.length === urls.length
            ? `Showing all ${urls.length} short URLs`
            : `Showing ${filteredUrls.length} of ${urls.length} URLs`}
        </div>
      </div>

      {/* No results */}
      {filteredUrls.length === 0 && (
        <div style={{ background: surfaceCard, borderRadius: 8, padding: 48, textAlign: "center" }}>
          <p style={{ color: muted, fontSize: 14 }}>No URLs found matching &ldquo;{searchQuery}&rdquo;</p>
          <button
            type="button"
            onClick={() => setSearchQuery("")}
            style={{ marginTop: 12, fontSize: 13, color: ink, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
          >
            Clear search
          </button>
        </div>
      )}

      {/* Grid view */}
      {filteredUrls.length > 0 && view === "grid" && (
        <div>
          {Array.from(grouped.entries()).map(([category, entries]) => (
            <div key={category} style={{ marginBottom: 32 }}>
              <CategoryHeader category={category} count={entries.length} />
              <div style={{ display: "grid", gap: 10, gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))" }}>
                {entries.map((entry) => (
                  <UrlCard key={entry.path} {...entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List view — search: flat cards */}
      {filteredUrls.length > 0 && view === "list" && searchQuery && (
        <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
          {filteredUrls.map(({ path, target, desc }) => {
            const isExternal = target.startsWith("http");
            return (
              <a
                key={path}
                href={target}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                  background: surfaceCard,
                  padding: 16,
                  borderRadius: 8,
                  textDecoration: "none",
                  color: ink,
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <code style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, background: canvas, padding: "4px 10px", borderRadius: 4, color: ink }}>
                    {path}
                  </code>
                  {isExternal && <ExternalIcon style={{ width: 14, height: 14, color: mutedSoft }} />}
                </div>
                {desc && <p style={{ fontSize: 13, color: muted, margin: 0 }}>{desc}</p>}
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
                  <svg aria-hidden="true" style={{ width: 12, height: 12, flexShrink: 0 }} fill="none" viewBox="0 0 24 24" stroke={mutedSoft}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: mutedSoft, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{target}</span>
                </div>
              </a>
            );
          })}
        </div>
      )}

      {/* List view — default: grouped rows */}
      {filteredUrls.length > 0 && view === "list" && !searchQuery && (
        <div>
          {Array.from(grouped.entries()).map(([category, entries]) => (
            <div key={category} style={{ marginBottom: 32 }}>
              <CategoryHeader category={category} count={entries.length} />
              <div style={{ background: surfaceCard, borderRadius: 8, overflow: "hidden" }}>
                {entries.map(({ path, target, desc }, i) => {
                  const isExternal = target.startsWith("http");
                  return (
                    <a
                      key={path}
                      href={target}
                      target={isExternal ? "_blank" : undefined}
                      rel={isExternal ? "noopener noreferrer" : undefined}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 16,
                        padding: "12px 20px",
                        textDecoration: "none",
                        color: ink,
                        borderTop: i === 0 ? "none" : `1px solid ${hairline}`,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = canvas; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                    >
                      <code style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 600, color: ink, width: 120, flexShrink: 0 }}>
                        {path}
                      </code>
                      <p style={{ fontSize: 13, color: muted, flex: 1, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {desc ?? <span style={{ color: mutedSoft }}>—</span>}
                      </p>
                      <span style={{ fontFamily: "monospace", fontSize: 11, color: mutedSoft, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {target}
                      </span>
                      <svg aria-hidden="true" style={{ width: 14, height: 14, flexShrink: 0, color: mutedSoft }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
