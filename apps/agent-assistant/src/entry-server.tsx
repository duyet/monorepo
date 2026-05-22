import { DurableObject } from "cloudflare:workers";
import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";

export default createStartHandler(defaultStreamHandler);

export class ThreadStateDO extends DurableObject {
  constructor(ctx: DurableObjectState, env: any) {
    super(ctx, env);

    // Initialize the SQLite tables in a transaction/concurrency block
    this.ctx.blockConcurrencyWhile(async () => {
      // 1. Table for checkpoints
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS checkpoints (
          thread_id TEXT NOT NULL,
          checkpoint_ns TEXT NOT NULL,
          checkpoint_id TEXT NOT NULL,
          parent_checkpoint_id TEXT,
          checkpoint TEXT NOT NULL,
          metadata TEXT NOT NULL,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id)
        )
      `);

      // 2. Table for writes
      this.ctx.storage.sql.exec(`
        CREATE TABLE IF NOT EXISTS checkpoint_writes (
          thread_id TEXT NOT NULL,
          checkpoint_ns TEXT NOT NULL,
          checkpoint_id TEXT NOT NULL,
          task_id TEXT NOT NULL,
          idx INTEGER NOT NULL,
          channel TEXT NOT NULL,
          value TEXT NOT NULL,
          PRIMARY KEY (thread_id, checkpoint_ns, checkpoint_id, task_id, idx)
        )
      `);
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      if (request.method === "POST" && path === "/put") {
        const {
          threadId,
          checkpointNs,
          checkpointId,
          parentCheckpointId,
          checkpoint,
          metadata,
        } = (await request.json()) as any;

        this.ctx.storage.sql.exec(
          `INSERT OR REPLACE INTO checkpoints 
           (thread_id, checkpoint_ns, checkpoint_id, parent_checkpoint_id, checkpoint, metadata) 
           VALUES (?, ?, ?, ?, ?, ?)`,
          threadId,
          checkpointNs,
          checkpointId,
          parentCheckpointId || null,
          JSON.stringify(checkpoint),
          JSON.stringify(metadata)
        );

        return new Response("OK");
      }

      if (request.method === "POST" && path === "/delete") {
        const { threadId } = (await request.json()) as any;
        this.ctx.storage.sql.exec(
          "DELETE FROM checkpoints WHERE thread_id = ?",
          threadId
        );
        this.ctx.storage.sql.exec(
          "DELETE FROM checkpoint_writes WHERE thread_id = ?",
          threadId
        );
        return new Response("OK");
      }

      if (request.method === "POST" && path === "/get") {
        const { threadId, checkpointNs, checkpointId } =
          (await request.json()) as any;

        let row: any;
        if (checkpointId) {
          row = this.ctx.storage.sql
            .exec(
              `SELECT * FROM checkpoints 
             WHERE thread_id = ? AND checkpoint_ns = ? AND checkpoint_id = ?`,
              threadId,
              checkpointNs,
              checkpointId
            )
            .one();
        } else {
          // If no specific checkpointId is provided, get the latest checkpoint by created_at timestamp
          row = this.ctx.storage.sql
            .exec(
              `SELECT * FROM checkpoints 
             WHERE thread_id = ? AND checkpoint_ns = ? 
             ORDER BY created_at DESC LIMIT 1`,
              threadId,
              checkpointNs
            )
            .one();
        }

        if (!row) {
          return new Response(JSON.stringify({}), { status: 404 });
        }

        return Response.json({
          thread_id: row.thread_id,
          checkpoint_ns: row.checkpoint_ns,
          checkpoint_id: row.checkpoint_id,
          parent_checkpoint_id: row.parent_checkpoint_id,
          checkpoint: JSON.parse(row.checkpoint as string),
          metadata: JSON.parse(row.metadata as string),
        });
      }

      if (request.method === "POST" && path === "/putWrites") {
        const { threadId, checkpointNs, checkpointId, taskId, writes } =
          (await request.json()) as any;

        // Transactionally insert all writes
        for (let idx = 0; idx < writes.length; idx++) {
          const write = writes[idx];
          this.ctx.storage.sql.exec(
            `INSERT OR REPLACE INTO checkpoint_writes 
             (thread_id, checkpoint_ns, checkpoint_id, task_id, idx, channel, value) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            threadId,
            checkpointNs,
            checkpointId,
            taskId,
            idx,
            write.channel,
            JSON.stringify(write.value)
          );
        }

        return new Response("OK");
      }

      if (request.method === "POST" && path === "/list") {
        const { threadId, checkpointNs } = (await request.json()) as any;

        const cursor = this.ctx.storage.sql.exec(
          `SELECT * FROM checkpoints 
           WHERE thread_id = ? AND checkpoint_ns = ? 
           ORDER BY created_at DESC`,
          threadId,
          checkpointNs
        );

        const list = [];
        for (const row of cursor) {
          list.push({
            thread_id: row.thread_id,
            checkpoint_ns: row.checkpoint_ns,
            checkpoint_id: row.checkpoint_id,
            parent_checkpoint_id: row.parent_checkpoint_id,
            checkpoint: JSON.parse(row.checkpoint as string),
            metadata: JSON.parse(row.metadata as string),
          });
        }

        return Response.json({ list });
      }

      return new Response("Not Found", { status: 404 });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}

// Prevent tree-shaking and ensure export is preserved
if (typeof globalThis !== "undefined") {
  (globalThis as any).__ThreadStateDO = ThreadStateDO;
}
