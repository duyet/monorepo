/**
 * agentOS Pi example – end-to-end round-trip
 *
 * Usage:
 *   ANTHROPIC_API_KEY=sk-... node index.mjs
 *
 * What it does:
 *   1. Creates a lightweight agentOS VM with Pi + common software.
 *   2. Opens a Pi agent session.
 *   3. Sends a prompt and streams back all session events.
 *   4. Reads the file the agent wrote to verify the round-trip.
 *   5. Closes the session and disposes the VM.
 *
 * Docs: https://agentos-sdk.dev/docs
 */

import { AgentOs } from "@rivet-dev/agentos-core";
import common from "@agentos-software/common";
import pi from "@agentos-software/pi";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
if (!ANTHROPIC_API_KEY) {
  console.error("Error: ANTHROPIC_API_KEY environment variable is required.");
  process.exit(1);
}

console.log("🚀 Booting agentOS VM...");
const vm = await AgentOs.create({ software: [common, pi] });
console.log("✅ VM ready\n");

// Create a Pi agent session
const { sessionId } = await vm.createSession("pi", {
  env: { ANTHROPIC_API_KEY },
});
console.log(`📝 Session created: ${sessionId}\n`);

// Stream session events (tool calls, agent messages, etc.)
vm.onSessionEvent(sessionId, (event) => {
  const type = event.type ?? "event";
  if (type === "message" || type === "content") {
    process.stdout.write(`[${type}] ${JSON.stringify(event).slice(0, 200)}\n`);
  } else {
    process.stdout.write(`[${type}]\n`);
  }
});

// Send the prompt
const prompt = "Write a hello world script to /home/agentos/hello.js";
console.log(`📨 Sending prompt: "${prompt}"\n`);
await vm.prompt(sessionId, prompt);

// Read back the file the agent wrote
console.log("\n📂 Reading /home/agentos/hello.js ...");
try {
  const content = await vm.readFile("/home/agentos/hello.js");
  const text = new TextDecoder().decode(content);
  console.log("✅ File contents:\n");
  console.log(text);
} catch (err) {
  console.error("⚠️  Could not read file:", err.message);
}

// Teardown
vm.closeSession(sessionId);
await vm.dispose();
console.log("\n🏁 Done.");
