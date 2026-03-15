export const onRequestGet = async (context: any) => {
  const { AGENTS_DB } = context.env;
  if (!AGENTS_DB) {
    return new Response(
      JSON.stringify({ error: "Missing AGENTS_DB binding" }),
      { status: 500 }
    );
  }

  try {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    // Total Volume over time (last 30 days)
    const [volumeRes, activeUsersRes, toolUsageRes, statsRes] =
      await AGENTS_DB.batch([
        AGENTS_DB.prepare(`
        SELECT date(created_at / 1000, 'unixepoch') as date, mode, COUNT(*) as count
        FROM conversations
        WHERE created_at >= ?
        GROUP BY date(created_at / 1000, 'unixepoch'), mode
        ORDER BY date ASC
      `).bind(thirtyDaysAgo),
        AGENTS_DB.prepare(`
        SELECT COUNT(DISTINCT user_id) as total
        FROM conversations
        WHERE user_id IS NOT NULL AND created_at >= ?
      `).bind(thirtyDaysAgo),
        AGENTS_DB.prepare(`
        SELECT role, COUNT(*) as count
        FROM messages
        WHERE timestamp >= ?
        GROUP BY role
      `).bind(thirtyDaysAgo),
        AGENTS_DB.prepare(`
        SELECT
          (SELECT COUNT(*) FROM conversations) as total_conversations,
          (SELECT COUNT(*) FROM messages) as total_messages
      `),
      ]);

    const dailyVolume = volumeRes.results || [];
    const activeUsers30d = (activeUsersRes.results[0] as any)?.total || 0;
    const roleDistribution = toolUsageRes.results || [];
    const globalStats = statsRes.results[0] || {
      total_conversations: 0,
      total_messages: 0,
    };

    return new Response(
      JSON.stringify({
        dailyVolume,
        activeUsers30d,
        roleDistribution,
        globalStats,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Agents Analytics Error:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to fetch agent analytics",
        details: String(error),
      }),
      { status: 500 }
    );
  }
};
