import { createDatabaseClient } from "../../lib/db/client";

export const onRequestGet = async (context: any) => {
  const { DB } = context.env;
  if (!DB) {
    return new Response(JSON.stringify({ error: "Missing DB binding" }), {
      status: 500,
    });
  }

  try {
    const dbClient = createDatabaseClient(DB);

    // Simple aggregations using standard standard DB client approaches or raw queries.
    // If the db client doesn't expose analytics directly, we can run raw SQL.
    // Assuming the structure from typical setup.
    // Let's run a batch of generic metrics queries.

    // We'll wrap in try-catch raw queries if dbClient lacks custom methods.
    const _stmtDb = (dbClient as any).db; // D1 binding is usually accessible on the client instance or we use the raw DB binding.

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

    // Time-series mock or realistic query for last 7 days conversation creations
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
