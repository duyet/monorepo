const { spawn } = require("node:child_process");
const http = require("node:http");
const httpProxy = require("http-proxy");

// Configuration
const NEXT_PORT = parseInt(process.env.PORT, 10) || 3004;
const FUNCTION_PORT = NEXT_PORT + 1; // 3005
const PROXY_PORT = NEXT_PORT + 2; // 3006
const PROXY_HOST = "http://localhost";

console.log(`\x1b[36m[Proxy]\x1b[0m Starting Development Server Proxy...`);
console.log(`\x1b[36m[Proxy]\x1b[0m Next.js UI: http://localhost:${NEXT_PORT}`);
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
    // Route everything else to next.js dev server
    proxy.web(req, res, { target: `${PROXY_HOST}:${NEXT_PORT}` });
  }
});

server.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/api/") || req.url === "/api") {
    proxy.ws(req, socket, head, { target: `${PROXY_HOST}:${FUNCTION_PORT}` });
  } else {
    proxy.ws(req, socket, head, { target: `${PROXY_HOST}:${NEXT_PORT}` });
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
    `\x1b[32m[Proxy]\x1b[0m -> All other requests will be forwarded to Next.js`
  );
  startProcesses();
});

// Start child processes
function startProcesses() {
  // 1. Start Next.js
  const nextProcess = spawn(
    "bun",
    ["--bun", "next", "dev", "--turbopack", "-p", NEXT_PORT.toString()],
    {
      stdio: "inherit",
      env: { ...process.env, PORT: NEXT_PORT.toString() },
    }
  );

  // 2. Start Wrangler Functions
  const wranglerProcess = spawn(
    "bunx",
    ["wrangler", "pages", "dev", "--port", FUNCTION_PORT.toString()],
    {
      stdio: "inherit",
      env: process.env,
    }
  );

  // Cleanup on exit
  function cleanup() {
    console.log(`\x1b[36m[Proxy]\x1b[0m Shutting down...`);
    server.close();
    nextProcess.kill();
    wranglerProcess.kill();
    process.exit(0);
  }

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
}
