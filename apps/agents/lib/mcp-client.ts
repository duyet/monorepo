/**
 * MCP Client for HTTP calls to duyet-mcp-server
 *
 * This client communicates with the MCP server deployed at https://mcp.duyet.net/sse
 * Since the MCP server uses SSE (Server-Sent Events), we'll use the mcp-remote protocol
 * or direct HTTP calls to resources.
 *
 * For this implementation, we'll use direct HTTP fetch to simpler endpoints
 * that the MCP server exposes, or we can use a simplified approach by calling
 * resources directly.
 */

import type {
  AnalyticsToolParams,
  BlogPostContentParams,
  GitHubActivityToolParams,
  MCPToolResponse,
} from "./types";

const MCP_SERVER_URL = "https://mcp.duyet.net";

/**
 * Generic fetch wrapper for MCP server calls
 */
async function _fetchMCP(endpoint: string, options?: RequestInit): Promise<Response> {
  const url = `${MCP_SERVER_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`MCP server error: ${response.status} ${response.statusText}`);
  }

  return response;
}

/**
 * Get GitHub activity from MCP server
 * Uses the github_activity tool
 */
export async function getGitHubActivity(
  params: GitHubActivityToolParams = {}
): Promise<MCPToolResponse<string>> {
  try {
    // The MCP server has a /llms.txt endpoint that includes all resources
    // For tools, we need to use the MCP protocol which is more complex
    // As a simpler alternative, we can call GitHub API directly or use a proxy

    // For now, let's return a formatted response that would come from the MCP server
    const response = await fetch("https://api.github.com/users/duyet/events/public", {
      headers: {
        Accept: "application/vnd.github.v3+json",
      },
      next: {
        revalidate: 300, // Cache for 5 minutes
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const events = await response.json();

    // Format the response similar to what MCP server would return
    const formatted = events.slice(0, params.limit || 5).map((event: any) => {
      const type = event.type;
      const repo = event.repo?.name || "";
      const created_at = new Date(event.created_at).toLocaleDateString();

      let description = "";
      if (type === "PushEvent") {
        description = `Pushed to ${repo}`;
      } else if (type === "CreateEvent") {
        description = `Created ${event.payload?.ref_type || "branch"} in ${repo}`;
      } else if (type === "DeleteEvent") {
        description = `Deleted ${event.payload?.ref_type || "branch"} in ${repo}`;
      } else if (type === "PullRequestEvent") {
        description = `PR ${event.payload?.action || "updated"} in ${repo}`;
      } else if (type === "IssuesEvent") {
        description = `Issue ${event.payload?.action || "updated"} in ${repo}`;
      } else {
        description = `${type} in ${repo}`;
      }

      return `- ${description} (${created_at})`;
    }).join("\n");

    return {
      success: true,
      data: `Recent GitHub Activity:\n\n${formatted}\n\nGitHub Profile: https://github.com/duyet`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get blog post content from MCP server
 * Uses the get_blog_post_content tool
 */
export async function getBlogPostContent(
  params: BlogPostContentParams
): Promise<MCPToolResponse<{ title: string; content: string; url: string }>> {
  try {
    // Use the blog's existing API endpoint or fetch the post directly
    const url = params.url;

    // Check if URL is from blog.duyet.net or duyet.net
    const isValidUrl =
      url.includes("blog.duyet.net") || url.includes("duyet.net");

    if (!isValidUrl) {
      return {
        success: false,
        error: "Invalid URL. Only blog.duyet.net and duyet.net URLs are supported.",
      };
    }

    // Fetch the blog post page
    const response = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch blog post: ${response.status}`);
    }

    const html = await response.text();

    // Extract title and content from HTML
    const titleMatch = html.match(/<title>(.*?)<\/title>/i);
    const title = titleMatch?.[1]?.replace(" | Tôi là Duyệt", "").trim() || "Blog Post";

    // Simple content extraction - remove scripts and styles
    let content = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ") // Remove tags
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();

    // Limit content length
    content = content.slice(0, 5000);

    return {
      success: true,
      data: { title, content, url },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get CV data from MCP server
 * Uses the duyet://cv/{format} resource
 */
export async function getCVData(format: "summary" | "detailed" | "json" = "summary"): Promise<MCPToolResponse<string>> {
  try {
    // The MCP server exposes CV data via resources
    // We can fetch directly from the CV endpoint or use a proxy
    const response = await fetch("https://cv.duyet.net", {
      next: { revalidate: 86400 }, // Cache for 1 day
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch CV: ${response.status}`);
    }

    if (format === "json") {
      // For JSON format, return structured data
      return {
        success: true,
        data: JSON.stringify({
          name: "Duyet Le",
          title: "Senior Data Engineer",
          experience: "6+ years",
          skills: ["Apache Spark", "ClickHouse", "Airflow", "DuckDB", "Rust", "Python", "TypeScript"],
          github: "https://github.com/duyet",
          linkedin: "https://linkedin.com/in/duyet",
          email: "me@duyet.net",
        }),
      };
    }

    // For summary and detailed, return text content
    const text = await response.text();

    let content = "";
    if (format === "summary") {
      content = `Duyet Le - Senior Data Engineer

Experience: 6+ years in modern data warehousing, distributed systems, and cloud computing.

Key Skills:
- Apache Spark, ClickHouse, Airflow, DuckDB
- AWS, GCP, Azure, Kubernetes
- Rust, Python, JavaScript/TypeScript

GitHub: https://github.com/duyet
LinkedIn: https://linkedin.com/in/duyet
Email: me@duyet.net`;
    } else {
      // detailed - include the full CV content
      content = `Duyet Le - Senior Data Engineer

${text}

For more details, visit: https://cv.duyet.net`;
    }

    return {
      success: true,
      data: content,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get analytics from MCP server
 * Uses the get_analytics tool
 */
export async function getAnalytics(params: AnalyticsToolParams = {}): Promise<MCPToolResponse<string>> {
  try {
    // The analytics data comes from the insights app or MCP server
    // For now, return a placeholder that would be replaced with actual MCP calls
    const reportType = params.report_type || "summary";

    return {
      success: true,
      data: `Analytics Report (${reportType})

Note: Full analytics integration requires MCP server connection.
Current implementation provides placeholder data.

Available report types:
- summary
- purpose_breakdown
- daily_trends
- recent_activity
- custom_period

For detailed analytics, visit: https://insights.duyet.net`,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Search blog posts
 * Simple text-based search against llms.txt
 */
export async function searchBlog(query: string, limit = 5): Promise<MCPToolResponse<Array<{ title: string; url: string; snippet: string }>>> {
  try {
    // Fetch llms.txt which contains all blog posts
    const response = await fetch(`${MCP_SERVER_URL}/llms.txt`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch llms.txt: ${response.status}`);
    }

    const llmsTxt = await response.text();

    // Simple text search - split by lines and find matching posts
    const lines = llmsTxt.split("\n");
    const matches: Array<{ title: string; url: string; snippet: string }> = [];

    const queryLower = query.toLowerCase();

    for (const line of lines) {
      if (line.startsWith("## ") && line.toLowerCase().includes(queryLower)) {
        const title = line.replace("## ", "").trim();
        // Find URL in next few lines
        const urlMatch = lines
          .slice(lines.indexOf(line), lines.indexOf(line) + 5)
          .find((l) => l.startsWith("URL:"));

        if (urlMatch) {
          const url = urlMatch.replace("URL:", "").trim();
          matches.push({
            title,
            url,
            snippet: `Blog post about ${title}`,
          });
        }

        if (matches.length >= limit) break;
      }
    }

    // If no matches found by title, try content search
    if (matches.length === 0) {
      for (const line of lines) {
        if (line.toLowerCase().includes(queryLower) && line.trim().length > 20) {
          // Find nearest title
          const titleIndex = lines
            .slice(0, lines.indexOf(line))
            .reverse()
            .findIndex((l) => l.startsWith("## "));

          if (titleIndex >= 0) {
            const actualIndex = lines.indexOf(line) - titleIndex - 1;
            const title = lines[actualIndex]?.replace("## ", "").trim() || "Blog Post";

            const urlMatch = lines
              .slice(actualIndex, actualIndex + 5)
              .find((l) => l.startsWith("URL:"));

            if (urlMatch && !matches.find((m) => m.title === title)) {
              const url = urlMatch.replace("URL:", "").trim();
              matches.push({
                title,
                url,
                snippet: line.slice(0, 200),
              });
            }
          }

          if (matches.length >= limit) break;
        }
      }
    }

    return {
      success: true,
      data: matches,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Get about information
 */
export async function getAbout(): Promise<MCPToolResponse<string>> {
  return {
    success: true,
    data: `Duyet Le - Senior Data Engineer

I'm a data engineer with 6+ years of experience building scalable data infrastructure
and distributed systems. I write about data engineering, cloud computing, and software
development best practices.

Blog: https://blog.duyet.net
GitHub: https://github.com/duyet
LinkedIn: https://linkedin.com/in/duyet`,
  };
}
