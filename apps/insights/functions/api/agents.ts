export const onRequestGet = async (context: any) => {
  const { AGENTS_DB } = context.env;
  if (!AGENTS_DB) {
    return new Response(
      JSON.stringify({ error: "Missing AGENTS_DB binding" }),
      { status: 500 }
    );
  }

  try {

    // Total Volume over time (last 30 days)
    const [volumeRes, activeUsersRes, toolUsageRes, statsRes] =
      await AGENTS_DB.batch([
        AGENTS_DB.prepare(`
        SELECT date(created_at) as date, mode, COUNT(*) as count 
        FROM conversations 
        WHERE created_at >= date('now', '-30 days')
        GROUP BY date(created_at), mode
        ORDER BY date ASC
      `),
        AGENTS_DB.prepare(`
        SELECT COUNT(DISTINCT user_id) as total 
        FROM conversations 
        WHERE user_id IS NOT NULL AND created_at >= date('now', '-30 days')
      `),
        // Approximate tool usage: We can extract tools from messages if we had a dedicated column,
        // but assuming we're tracking 'toolCalls' inside message JSON 'content' or 'metadata'
        // For now, we simulate this by parsing the messages or using total tool calls if tracked natively.
        AGENTS_DB.prepare(`
        SELECT role, COUNT(*) as count 
        FROM messages 
        WHERE created_at >= date('now', '-30 days')
        GROUP BY role
      `),
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
