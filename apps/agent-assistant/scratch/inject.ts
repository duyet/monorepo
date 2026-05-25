import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const rootDir = "/Users/duet/project/monorepo";
const appPath = join(rootDir, "apps/agent-assistant");
const serverBundlePath = join(appPath, "dist/duyet_agent_assistant/index.js");

console.log("Injecting ThreadStateDO into compiled server.js bundle...");
if (existsSync(serverBundlePath)) {
  let content = readFileSync(serverBundlePath, "utf-8");

  // Patch createServerEntry to capture the env bindings object and assign to globalThis.CF_ENV
  if (content.includes("return await entry.fetch(...args);")) {
    console.log(
      "Patching createServerEntry to capture global environment bindings..."
    );
    content = content.replace(
      "return await entry.fetch(...args);",
      "if (args[1]) { globalThis.CF_ENV = args[1]; }\n\t\treturn await entry.fetch(...args);"
    );
  }

  // Define self-contained Durable Object class to append
  const doClassCode = `
import { DurableObject } from "cloudflare:workers";

export class ThreadStateDO extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.ctx.blockConcurrencyWhile(async () => {
      this.ctx.storage.sql.exec(\`
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
      \`);
      this.ctx.storage.sql.exec(\`
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
      \`);
    });
  }

  async fetch(request) {
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
        } = await request.json();
        this.ctx.storage.sql.exec(
          \`INSERT OR REPLACE INTO checkpoints 
           (thread_id, checkpoint_ns, checkpoint_id, parent_checkpoint_id, checkpoint, metadata) 
           VALUES (?, ?, ?, ?, ?, ?)\`,
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
        const { threadId } = await request.json();
        this.ctx.storage.sql.exec("DELETE FROM checkpoints WHERE thread_id = ?", threadId);
        this.ctx.storage.sql.exec("DELETE FROM checkpoint_writes WHERE thread_id = ?", threadId);
        return new Response("OK");
      }
      if (request.method === "POST" && path === "/get") {
        const { threadId, checkpointNs, checkpointId } = await request.json();
        let row;
        if (checkpointId) {
          row = this.ctx.storage.sql
            .exec(
              \`SELECT * FROM checkpoints 
             WHERE thread_id = ? AND checkpoint_ns = ? AND checkpoint_id = ?\`,
              threadId,
              checkpointNs,
              checkpointId
            )
            .one();
        } else {
          row = this.ctx.storage.sql
            .exec(
              \`SELECT * FROM checkpoints 
             WHERE thread_id = ? AND checkpoint_ns = ? 
             ORDER BY created_at DESC LIMIT 1\`,
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
          checkpoint: JSON.parse(row.checkpoint),
          metadata: JSON.parse(row.metadata),
        });
      }
      if (request.method === "POST" && path === "/putWrites") {
        const { threadId, checkpointNs, checkpointId, taskId, writes } = await request.json();
        for (let idx = 0; idx < writes.length; idx++) {
          const write = writes[idx];
          this.ctx.storage.sql.exec(
            \`INSERT OR REPLACE INTO checkpoint_writes 
             (thread_id, checkpoint_ns, checkpoint_id, task_id, idx, channel, value) 
             VALUES (?, ?, ?, ?, ?, ?, ?)\`,
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
        const { threadId, checkpointNs } = await request.json();
        const cursor = this.ctx.storage.sql.exec(
          \`SELECT * FROM checkpoints 
           WHERE thread_id = ? AND checkpoint_ns = ? 
           ORDER BY created_at DESC\`,
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
            checkpoint: JSON.parse(row.checkpoint),
            metadata: JSON.parse(row.metadata),
          });
        }
        return Response.json({ list });
      }
      return new Response("Not Found", { status: 404 });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
}
`;

  // Make sure we only inject once
  if (content.includes("class ThreadStateDO")) {
    console.log(
      "ThreadStateDO already injected in server bundle, skipping DO injection."
    );
  } else {
    writeFileSync(serverBundlePath, `${content}\n\n${doClassCode}`, "utf-8");
    console.log("Injection completed successfully!");
  }
} else {
  console.error("Server bundle not found! Cannot inject ThreadStateDO.");
  process.exit(1);
}

// Recursively patch any .js files in the distribution directory to safely catch createRequire exceptions
import { readdirSync, statSync } from "node:fs";

function patchCreateRequire(dirPath: string) {
  if (!existsSync(dirPath)) return;
  const files = readdirSync(dirPath);
  for (const file of files) {
    const fullPath = join(dirPath, file);
    if (statSync(fullPath).isDirectory()) {
      patchCreateRequire(fullPath);
    } else if (file.endsWith(".js")) {
      let fileContent = readFileSync(fullPath, "utf-8");
      if (fileContent.includes("createRequire(import.meta.url)")) {
        console.log(`Patching createRequire in ${file}...`);
        fileContent = fileContent.replace(
          /createRequire\(import\.meta\.url\)/g,
          'typeof createRequire !== "undefined" ? (() => { try { return createRequire(import.meta.url || "file:///index.js"); } catch (e) { return () => {}; } })() : () => {}'
        );
        writeFileSync(fullPath, fileContent, "utf-8");
      }
    }
  }
}

console.log("Scanning assets and chunks for createRequire(import.meta.url)...");
patchCreateRequire(join(appPath, "dist/duyet_agent_assistant"));
console.log("Patching completed!");
