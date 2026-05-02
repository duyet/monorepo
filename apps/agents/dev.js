import { spawn } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import http from "node:http";
import process from "node:process";
import httpProxy from "http-proxy";

// Configuration
const VITE_PORT = parseInt(process.env.PORT, 10) || 3004;
const FUNCTION_PORT = VITE_PORT + 1; // 3005
const PROXY_PORT = VITE_PORT + 2; // 3006
const PROXY_HOST = "http://localhost";
const ENV_FILES = [
  "../../.env",
  "../../.env.local",
  "../../.env.production",
  "../../.env.production.local",
  ".env.local",
  ".dev.vars",
];

for (const file of ENV_FILES) {
  loadEnvFile(file);
}

console.log(`\x1b[36m[Proxy]\x1b[0m Starting Development Server Proxy...`);
console.log(`\x1b[36m[Proxy]\x1b[0m Vite UI: http://localhost:${VITE_PORT}`);
console.log(
  `\x1b[36m[Proxy]\x1b[0m Wrangler API: http://localhost:${FUNCTION_PORT}`
);
console.log(
  `\x1b[36m[Proxy]\x1b[0m Unified URL: http://localhost:${PROXY_PORT}`
);

// Create a proxy server
const proxy = httpProxy.createProxyServer({
  ws: true,
  changeOrigin: true,
});

proxy.on("error", (_err, _req, res) => {
  if (res?.writeHead) {
    res.writeHead(502, { "Content-Type": "text/plain" });
    res.end("Bad Gateway. The target service might still be starting up.");
  }
});

// Start unified server
const server = http.createServer((req, res) => {
  // Route /api/* requests to wrangler functions
  if (req.url.startsWith("/api/") || req.url === "/api") {
    proxy.web(req, res, { target: `${PROXY_HOST}:${FUNCTION_PORT}` });
  } else {
    // Route everything else to vite dev server
    proxy.web(req, res, { target: `${PROXY_HOST}:${VITE_PORT}` });
  }
});

server.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/api/") || req.url === "/api") {
    proxy.ws(req, socket, head, { target: `${PROXY_HOST}:${FUNCTION_PORT}` });
  } else {
    proxy.ws(req, socket, head, { target: `${PROXY_HOST}:${VITE_PORT}` });
  }
});

server.listen(PROXY_PORT, () => {
  console.log(
    `\x1b[32m[Proxy]\x1b[0m Listening on http://localhost:${PROXY_PORT}`
  );
  console.log(
    `\x1b[32m[Proxy]\x1b[0m -> All requests to /api/* will be forwarded to Wrangler`
  );
  console.log(
    `\x1b[32m[Proxy]\x1b[0m -> All other requests will be forwarded to Vite`
  );
  startProcesses();
});

// Start child processes
function startProcesses() {
  // 1. Start Vite dev server
  const viteProcess = spawn(
    "bun",
    ["--bun", "x", "vite", "--port", VITE_PORT.toString()],
    {
      stdio: "inherit",
      env: { ...process.env, PORT: VITE_PORT.toString() },
    }
  );

  // 2. Start Wrangler Functions
  const wranglerProcess = spawn(
    "bun",
    [
      "x",
      "wrangler",
      "pages",
      "dev",
      ...wranglerBindings(),
      "--port",
      FUNCTION_PORT.toString(),
    ],
    {
      stdio: "inherit",
      env: process.env,
    }
  );

  // Cleanup on exit
  function cleanup() {
    console.log(`\x1b[36m[Proxy]\x1b[0m Shutting down...`);
    server.close();
    viteProcess.kill();
    wranglerProcess.kill();
    process.exit(0);
  }

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}

function wranglerBindings() {
  if (!process.env.CLOUDFLARE_ACCOUNT_ID) return [];
  return [
    "--binding",
    `CLOUDFLARE_ACCOUNT_ID=${process.env.CLOUDFLARE_ACCOUNT_ID}`,
  ];
}

function loadEnvFile(file) {
  if (!existsSync(file)) return;

  for (const line of readFileSync(file, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}
