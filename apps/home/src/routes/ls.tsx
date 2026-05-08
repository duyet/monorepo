import { createFileRoute } from "@tanstack/react-router";
import {
  CATEGORY_MAP,
  CATEGORY_ORDER,
  DEFAULT_CATEGORY,
} from "../../app/config/categories";
import { urls } from "../../app/config/urls";
import UrlsList from "../components/UrlsList";

export const Route = createFileRoute("/ls")({
  component: ListPage,
});

// Computed once at module load — urls and categories are static
const publicUrls = Object.entries(urls)
  .filter(([_, value]) => {
    if (typeof value === "string") return true;
    return !value.system;
  })
  .map(([path, value]) => ({
    path,
    target: typeof value === "string" ? value : value.target,
    desc: typeof value === "string" ? undefined : value.desc,
    category: CATEGORY_MAP[path] ?? DEFAULT_CATEGORY,
  }))
  .sort((a, b) => {
    const aIdx = CATEGORY_ORDER.indexOf(a.category);
    const bIdx = CATEGORY_ORDER.indexOf(b.category);
    const catDiff = (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx);
    if (catDiff !== 0) return catDiff;
    return a.path.localeCompare(b.path);
  });

function ListPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#faf9f5", color: "#141413" }}>
      <main style={{ maxWidth: 1024, margin: "0 auto", padding: "48px 16px 64px" }}>
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              fontSize: 13,
              color: "#8e8b82",
              textDecoration: "none",
              marginBottom: 24,
            }}
          >
            <svg aria-hidden="true" style={{ width: 14, height: 14 }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </a>
          <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
            <h1 style={{ fontFamily: '"Cormorant Garamond", "Garamond", "Times New Roman", serif', fontSize: 48, fontWeight: 400, color: "#141413", margin: 0 }}>
              Short URLs
            </h1>
            <span style={{ fontSize: 13, color: "#8e8b82" }}>
              {publicUrls.length}
            </span>
          </div>
          <p style={{ marginTop: 8, fontSize: 16, color: "#6c6a64" }}>
            Quick links and redirects for duyet.net
          </p>
        </div>

        {/* Client-side search and list */}
        <UrlsList urls={publicUrls} />

        {/* Footer link */}
        <div style={{ marginTop: 64, textAlign: "center" }}>
          <a
            href="/"
            style={{ fontSize: 13, color: "#8e8b82", textDecoration: "none" }}
          >
            duyet.net
          </a>
        </div>
      </main>
    </div>
  );
}
