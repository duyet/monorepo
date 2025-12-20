import type { GitHubEvent } from "./types";

/**
 * Fetch all GitHub events for a user within the last 12 weeks
 */
export async function fetchAllEvents(owner: string): Promise<GitHubEvent[]> {
  // Check if GitHub token is configured
  if (!process.env.GITHUB_TOKEN) {
    console.warn("GITHUB_TOKEN not configured, returning empty events");
    return [];
  }

  const allEvents: GitHubEvent[] = [];
  let page = 1;
  const perPage = 100;
  const twelveWeeksAgo = new Date(Date.now() - 12 * 7 * 24 * 60 * 60 * 1000);

  while (true) {
    try {
      console.log(`Fetching events page ${page} for ${owner}`);

      const response = await fetch(
        `https://api.github.com/users/${owner}/events?per_page=${perPage}&page=${page}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
            "User-Agent": "insights-app",
          },
          cache: "force-cache",
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          console.error("GitHub API authentication failed - invalid token");
        } else if (response.status === 403) {
          console.error("GitHub API rate limit exceeded or access forbidden");
        } else {
          console.error(
            `Failed to fetch events page ${page}: ${response.status} ${response.statusText}`
          );
        }
        break;
      }

      const events = await response.json();

      if (!events || !Array.isArray(events) || events.length === 0) {
        break; // No more events or invalid response
      }

      // Check if we've reached events older than 12 weeks
      const hasOldEvents = events.some(
        (event: { created_at: string }) =>
          new Date(event.created_at) < twelveWeeksAgo
      );

      // Add events that are within the 12-week window
      const recentEvents = events.filter(
        (event: { created_at: string }) =>
          new Date(event.created_at) >= twelveWeeksAgo
      );
      allEvents.push(...recentEvents);

      // If we found old events, we've gone back far enough
      if (hasOldEvents) {
        console.log(
          `Reached events older than 12 weeks, stopping at page ${page}`
        );
        break;
      }

      // If we got less than perPage items, we've reached the end
      if (events.length < perPage) {
        break;
      }

      page++;

      // Safety limit - GitHub events API typically shows last 90 days
      if (page > 10) {
        console.warn(`Reached page limit (${page}), stopping pagination`);
        break;
      }
    } catch (error) {
      console.error(`Error fetching events page ${page}:`, error);
      break;
    }
  }

  console.log(`Total events fetched: ${allEvents.length} (last 12 weeks)`);
  return allEvents;
}
