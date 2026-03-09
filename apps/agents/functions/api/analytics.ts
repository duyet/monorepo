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

    const trendRes = await DB.prepare(`
      SELECT date(created_at) as date, COUNT(*) as count
      FROM conversations
      WHERE created_at >= date('now', '-7 days')
      GROUP BY date(created_at)
      ORDER BY date ASC
    `).all();

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
