import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../blog/public/posts-data.json", () => ({
  default: [
    {
      slug: "/2024/03/clickhouse-monitoring",
      title: "ClickHouse Monitoring",
    },
    {
      slug: "/2026/07/open-managed-agents",
      title: "Open Managed Agents",
    },
  ],
}));

import { ProjectBlogLinks } from "../src/components/ProjectBlogLinks";
import { blogPostHref, resolveBlogPosts } from "../src/data/blog-posts";
import { apps } from "../src/data/projects";

describe("resolveBlogPosts", () => {
  it("keeps known slugs and drops unknowns", () => {
    expect(
      resolveBlogPosts([
        "/missing",
        "/2024/03/clickhouse-monitoring",
        "/2026/07/open-managed-agents",
      ])
    ).toEqual([
      {
        slug: "/2024/03/clickhouse-monitoring",
        title: "ClickHouse Monitoring",
      },
      {
        slug: "/2026/07/open-managed-agents",
        title: "Open Managed Agents",
      },
    ]);
  });

  it("returns an empty list when slugs are missing or unknown", () => {
    expect(resolveBlogPosts(undefined)).toEqual([]);
    expect(resolveBlogPosts([])).toEqual([]);
    expect(resolveBlogPosts(["/does-not-exist"])).toEqual([]);
  });

  it("honors the optional limit", () => {
    expect(
      resolveBlogPosts(
        ["/2024/03/clickhouse-monitoring", "/2026/07/open-managed-agents"],
        1
      )
    ).toEqual([
      {
        slug: "/2024/03/clickhouse-monitoring",
        title: "ClickHouse Monitoring",
      },
    ]);
  });
});

describe("ProjectBlogLinks", () => {
  it("renders blog post titles as links on the project card", () => {
    const html = renderToStaticMarkup(
      createElement(ProjectBlogLinks, {
        slugs: ["/2024/03/clickhouse-monitoring"],
        heading: "Related posts",
      })
    );

    expect(html).toContain("Related posts");
    expect(html).toContain("ClickHouse Monitoring");
    expect(html).toContain(
      'href="https://blog.duyet.net/2024/03/clickhouse-monitoring"'
    );
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  it("renders nothing when no valid posts resolve", () => {
    expect(
      renderToStaticMarkup(
        createElement(ProjectBlogLinks, { slugs: ["/does-not-exist"] })
      )
    ).toBe("");
    expect(renderToStaticMarkup(createElement(ProjectBlogLinks))).toBe("");
  });

  it("renders links for shipped project blogPosts slugs", () => {
    const chmonitor = apps.find((app) => app.name === "ClickHouse Monitoring");
    expect(chmonitor?.blogPosts).toContain("/2024/03/clickhouse-monitoring");

    const html = renderToStaticMarkup(
      createElement(ProjectBlogLinks, { slugs: chmonitor?.blogPosts })
    );
    expect(html).toContain(blogPostHref("/2024/03/clickhouse-monitoring"));
  });
});
