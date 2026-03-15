import { describe, expect, test } from "bun:test";

const API_URL = process.env.API_URL || "http://localhost:3006/api/chat";
const RUN_E2E = process.env.RUN_E2E === "true";

describe.skipIf(!RUN_E2E)("Agent Chat API - E2E (Real Integration)", () => {
  test("returns 200 and streams AI response in fast mode", async () => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messages: [
          {
            role: "user",
            content: "What is your name? Say just one word, no punctuation",
          },
        ],
        mode: "fast",
      }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toContain("text/event-stream");

    const reader = response.body?.getReader();
    expect(reader).toBeDefined();

    if (!reader) return;

    let textChunk = "";
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      textChunk += decoder.decode(value, { stream: true });
    }

    expect(textChunk.length).toBeGreaterThan(0);
    expect(textChunk).toContain("0:");
  }, 45000); // Wait plenty of time for real API

  test("returns 400 when sending invalid JSON", async () => {
    // Omitting body triggers our 400
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: "not-json-payload",
    });

    expect(response.status).toBe(400);
    const json = await response.json();
    expect(json.error).toContain("Invalid JSON");
  });
});
