import { getUserFromRequest } from "../../lib/auth";
import { createDatabaseClient } from "../../lib/db/client";

interface Env {
  DB: D1Database;
  CLERK_ISSUER_URL?: string;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const { DB } = env;

  if (!DB) {
    return new Response(JSON.stringify({ error: "Missing DB binding" }), {
      status: 500,
    });
  }

  // Require authentication for analytics data
  const user = await getUserFromRequest(request, env.CLERK_ISSUER_URL);
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
    });
  }

  try {
    const [convRes, msgRes, activeUsersRes] = await DB.batch([
      DB.prepare("SELECT COUNT(*) as total FROM conversations"),
      DB.prepare("SELECT COUNT(*) as total FROM messages"),
      DB.prepare(
        "SELECT COUNT(DISTINCT user_id) as total FROM conversations WHERE user_id IS NOT NULL"
      ),
    ]);

    const totalConversations = (convRes.results[0] as any)?.total || 0;
    const totalMessages = (msgRes.results[0] as any)?.total || 0;
    const totalUsers = (activeUsersRes.results[0] as any)?.total || 0;

    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const trendRes = await DB.prepare(`
      SELECT date(created_at / 1000, 'unixepoch') as date, COUNT(*) as count
      FROM conversations
      WHERE created_at >= ?
      GROUP BY date(created_at / 1000, 'unixepoch')
      ORDER BY date ASC
    `).bind(sevenDaysAgo).all();

    const dailyTrends = trendRes.results || [];

    return new Response(
      JSON.stringify({
        totalConversations,
        totalMessages,
        totalUsers,
        dailyTrends,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Analytics Error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to fetch analytics" }),
      { status: 500 }
    );
  }
};
