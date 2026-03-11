import { spawn } from "node:child_process";

async function waitForServer(url: string, timeout = 60000) {
  const start = Date.now();
  console.log(`[test-e2e] Waiting for ${url} to be fully ready...`);

  while (Date.now() - start < timeout) {
    try {
      const res = await fetch(url, {
        method: "POST",
        body: JSON.stringify({}),
        headers: { "Content-Type": "application/json" },
      });

      // If we don't get a 502 Bad Gateway from our proxy,
      // it means the Wrangler function is actually responding (e.g., with 400 Invalid body)
      if (res.status !== 502 && res.status !== 503) {
        return true;
      }
    } catch {
      // Proxy server is probably not even listening yet, just suppress and wait
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  throw new Error(`Server at ${url} did not become ready in time.`);
}

async function main() {
  const devPort = process.env.PORT || "3004";
  const proxyPort = parseInt(devPort, 10) + 2;
  const apiUrl = `http://localhost:${proxyPort}/api/chat`;

  console.log("[test-e2e] Starting dev server in background...");

  const server = spawn("bun", ["run", "dev"], {
    stdio: "inherit",
    env: { ...process.env, PORT: devPort },
  });

  try {
    await waitForServer(apiUrl);
    console.log("[test-e2e] API is routing properly. Running suite...");

    const testProcess = spawn("bun", ["test", "e2e/chat.e2e.test.ts"], {
      stdio: "inherit",
      env: { ...process.env, API_URL: apiUrl },
    });

    testProcess.on("close", (code) => {
      console.log(
        `[test-e2e] Finished with code ${code}. Shutting down server...`
      );
      server.kill("SIGTERM");
      process.exit(code || 0);
    });
  } catch (error) {
    console.error("[test-e2e] Setup failed:", error);
    server.kill("SIGTERM");
    process.exit(1);
  }
}

main();
