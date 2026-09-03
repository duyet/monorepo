#!/usr/bin/env node
/**
 * Chrome CDP drive for kb homepage zoom-labels.
 *
 *   node .cursor/skills/verify-kb/scripts/drive-zoom-labels.mjs \
 *     --url http://127.0.0.1:3009/ --out /tmp/verify-kb/<run-id>
 */
import { spawn } from "node:child_process";
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { setTimeout as delay } from "node:timers/promises";

function argValue(flag, fallback) {
  const idx = process.argv.indexOf(flag);
  return idx >= 0 && process.argv[idx + 1] ? process.argv[idx + 1] : fallback;
}

function chromeBin() {
  return (
    process.env.CHROME_BIN ||
    ["/usr/bin/google-chrome-stable", "/usr/bin/google-chrome"].find(existsSync)
  );
}

function freePort() {
  return 9222 + Math.floor(Math.random() * 400);
}

class Cdp {
  constructor(ws) {
    this.ws = ws;
    this.id = 0;
    this.pending = new Map();
    this.events = new Map();
    ws.addEventListener("message", (ev) => {
      const msg = JSON.parse(String(ev.data));
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id);
        this.pending.delete(msg.id);
        if (msg.error) reject(new Error(msg.error.message || "cdp error"));
        else resolve(msg.result);
        return;
      }
      if (msg.method && this.events.has(msg.method)) {
        for (const fn of this.events.get(msg.method)) fn(msg.params);
      }
    });
  }

  send(method, params = {}) {
    const id = ++this.id;
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject });
      this.ws.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, fn) {
    if (!this.events.has(method)) this.events.set(method, []);
    this.events.get(method).push(fn);
    return () => {
      const list = this.events.get(method) || [];
      this.events.set(
        method,
        list.filter((x) => x !== fn)
      );
    };
  }

  once(method) {
    return new Promise((resolve) => {
      const off = this.on(method, (params) => {
        off();
        resolve(params);
      });
    });
  }
}

async function waitForHttp(url, ms = 15000) {
  const start = Date.now();
  while (Date.now() - start < ms) {
    try {
      const res = await fetch(url);
      if (res.ok || res.status === 404) return;
    } catch {
      // retry
    }
    await delay(150);
  }
  throw new Error(`timeout waiting for ${url}`);
}

async function connectPage(debugPort, url) {
  const version = await fetch(`http://127.0.0.1:${debugPort}/json/version`).then(
    (r) => r.json()
  );
  const browser = new Cdp(new WebSocket(version.webSocketDebuggerUrl));
  await new Promise((resolve, reject) => {
    browser.ws.addEventListener("open", resolve);
    browser.ws.addEventListener("error", () =>
      reject(new Error("browser ws failed"))
    );
  });
  const { targetId } = await browser.send("Target.createTarget", { url });
  const { sessionId } = await browser.send("Target.attachToTarget", {
    targetId,
    flatten: true,
  });

  const session = {
    send(method, params = {}) {
      const id = ++browser.id;
      return new Promise((resolve, reject) => {
        browser.pending.set(id, { resolve, reject });
        browser.ws.send(
          JSON.stringify({
            id,
            method,
            params,
            sessionId,
          })
        );
      });
    },
    on: (method, fn) => browser.on(method, fn),
    once: (method) => browser.once(method),
  };
  return { browser, session };
}

async function evaluate(session, expression) {
  const result = await session.send("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true,
  });
  if (result.exceptionDetails) {
    const text =
      result.exceptionDetails.text ||
      result.exceptionDetails.exception?.description ||
      "evaluate failed";
    throw new Error(text);
  }
  return result.result?.value;
}

async function screenshot(session, path) {
  const { data } = await session.send("Page.captureScreenshot", {
    format: "png",
    fromSurface: true,
  });
  writeFileSync(path, Buffer.from(data, "base64"));
  return path;
}

async function main() {
  const outDir = argValue("--out", "/tmp/verify-kb/drive");
  const url = argValue("--url", "http://127.0.0.1:3009/");
  mkdirSync(outDir, { recursive: true });

  const bin = chromeBin();
  if (!bin) throw new Error("google-chrome not found");

  const debugPort = freePort();
  const chrome = spawn(
    bin,
    [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--hide-scrollbars",
      "--window-size=1280,800",
      "--enable-webgl",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-unsafe-swiftshader",
      "--ignore-gpu-blocklist",
      `--remote-debugging-port=${debugPort}`,
      "--remote-allow-origins=*",
      "about:blank",
    ],
    { stdio: ["ignore", "pipe", "pipe"] }
  );
  let chromeErr = "";
  chrome.stderr.on("data", (d) => {
    chromeErr += d;
    if (chromeErr.length > 4000) chromeErr = chromeErr.slice(-2000);
  });

  const frames = [];
  try {
    await waitForHttp(`http://127.0.0.1:${debugPort}/json/version`, 20000);
    const { browser, session } = await connectPage(debugPort, "about:blank");
    await session.send("Page.enable");
    await session.send("Runtime.enable");
    try {
      await session.send("Performance.enable");
    } catch {
      // optional
    }

    const loaded = session.once("Page.loadEventFired");
    await session.send("Page.navigate", { url });
    await Promise.race([loaded, delay(20000)]);

    const ready = await evaluate(
      session,
      `new Promise((resolve) => {
        const start = Date.now();
        const tick = () => {
          const el = document.querySelector('[data-kb-graph="2d"]');
          const ready = el && el.getAttribute('data-sigma-ready') === 'true';
          const probe = window.__kbGraph;
          if (ready && probe && probe.hideLabelsOnMove === false) {
            resolve({ ok: true, elapsedMs: Date.now() - start });
            return;
          }
          if (Date.now() - start > 25000) {
            resolve({
              ok: false,
              elapsedMs: Date.now() - start,
              hasEl: Boolean(el),
              sigmaReady: el ? el.getAttribute('data-sigma-ready') : null,
              hasProbe: Boolean(probe),
            });
            return;
          }
          requestAnimationFrame(tick);
        };
        tick();
      })`
    );

    // Staged reveal blanks labels for ~1.4s. Wait until ink exists or 3s.
    if (ready?.ok) {
      await evaluate(
        session,
        `new Promise((resolve) => {
          const start = Date.now();
          const tick = () => {
            const n = window.__kbGraph?.labelCanvasOpaquePixels ?? 0;
            if (n > 0 || Date.now() - start > 3000) {
              resolve(n);
              return;
            }
            requestAnimationFrame(tick);
          };
          tick();
        })`
      );
    }

    const restProbe = ready?.ok
      ? await evaluate(
          session,
          `({
            hideLabelsOnMove: window.__kbGraph.hideLabelsOnMove,
            hideEdgesOnMove: window.__kbGraph.hideEdgesOnMove,
            renderLabels: window.__kbGraph.renderLabels,
            cameraMoving: window.__kbGraph.cameraMoving,
            labelCanvasOpaquePixels: window.__kbGraph.labelCanvasOpaquePixels,
            refreshCount: window.__kbGraph.refreshCount,
            reducerResetCount: window.__kbGraph.reducerResetCount,
          })`
        )
      : null;

    let metricsBefore = null;
    try {
      metricsBefore = await session.send("Performance.getMetrics");
    } catch {
      metricsBefore = null;
    }

    const restPng = join(outDir, "rest.png");
    if (ready?.ok) await screenshot(session, restPng);

    const frameDir = join(outDir, "frames");
    mkdirSync(frameDir, { recursive: true });
    let frameI = 0;
    const offScreencast = session.on("Page.screencastFrame", async (params) => {
      try {
        const file = join(frameDir, `frame-${String(frameI).padStart(3, "0")}.jpg`);
        writeFileSync(file, Buffer.from(params.data, "base64"));
        frames.push(file);
        frameI += 1;
        await session.send("Page.screencastFrameAck", {
          sessionId: params.sessionId,
        });
      } catch {
        // ignore dropped frames
      }
    });
    try {
      await session.send("Page.startScreencast", {
        format: "jpeg",
        quality: 60,
        maxWidth: 1280,
        maxHeight: 800,
        everyNthFrame: 2,
      });
    } catch {
      // optional
    }

    const mid = ready?.ok
      ? await evaluate(
          session,
          `new Promise((resolve) => {
            const before = {
              hideLabelsOnMove: window.__kbGraph.hideLabelsOnMove,
              pixels: window.__kbGraph.labelCanvasOpaquePixels,
              moving: window.__kbGraph.cameraMoving,
              reducerResetCount: window.__kbGraph.reducerResetCount,
              refreshCount: window.__kbGraph.refreshCount,
            };
            window.__kbGraph.animateZoom(0.45, 900);
            const samples = [];
            const start = Date.now();
            const tick = () => {
              samples.push({
                t: Date.now() - start,
                moving: window.__kbGraph.cameraMoving,
                pixels: window.__kbGraph.labelCanvasOpaquePixels,
                hideLabelsOnMove: window.__kbGraph.hideLabelsOnMove,
              });
              if (Date.now() - start < 700) {
                requestAnimationFrame(tick);
                return;
              }
              resolve({
                before,
                samples,
                after: {
                  hideLabelsOnMove: window.__kbGraph.hideLabelsOnMove,
                  pixels: window.__kbGraph.labelCanvasOpaquePixels,
                  moving: window.__kbGraph.cameraMoving,
                  reducerResetCount: window.__kbGraph.reducerResetCount,
                  refreshCount: window.__kbGraph.refreshCount,
                },
              });
            };
            requestAnimationFrame(tick);
          })`
        )
      : null;

    const midPng = join(outDir, "zoom-mid.png");
    if (ready?.ok) await screenshot(session, midPng);
    await delay(400);
    const endPng = join(outDir, "zoom-end.png");
    if (ready?.ok) await screenshot(session, endPng);

    try {
      await session.send("Page.stopScreencast");
    } catch {
      // optional
    }
    offScreencast();

    let metricsAfter = null;
    try {
      metricsAfter = await session.send("Performance.getMetrics");
    } catch {
      metricsAfter = null;
    }

    const metric = (pack, name) =>
      pack?.metrics?.find((m) => m.name === name)?.value ?? null;
    const layoutCountDelta =
      metricsBefore && metricsAfter
        ? metric(metricsAfter, "LayoutCount") -
          metric(metricsBefore, "LayoutCount")
        : null;
    const recalcStyleDelta =
      metricsBefore && metricsAfter
        ? metric(metricsAfter, "RecalcStyleCount") -
          metric(metricsBefore, "RecalcStyleCount")
        : null;

    const midPixels = Array.isArray(mid?.samples)
      ? Math.max(...mid.samples.map((s) => s.pixels || 0), 0)
      : 0;
    const movingSample = Array.isArray(mid?.samples)
      ? mid.samples.find((s) => s.moving) || mid.samples[Math.floor(mid.samples.length / 2)]
      : null;

    const checks = {
      probeReady: Boolean(ready?.ok),
      hideLabelsOnMoveFalse: restProbe?.hideLabelsOnMove === false,
      hideEdgesOnMoveTrue: restProbe?.hideEdgesOnMove === true,
      renderLabels: restProbe?.renderLabels === true,
      reducersOnce: restProbe?.reducerResetCount === 1,
      restPixels: (restProbe?.labelCanvasOpaquePixels ?? 0) > 0,
      midPixels: midPixels > 0,
      midHideLabelsFalse:
        movingSample?.hideLabelsOnMove === false ||
        mid?.after?.hideLabelsOnMove === false,
      reducersUnchanged:
        restProbe?.reducerResetCount === 1 &&
        mid?.after?.reducerResetCount === 1,
    };
    const failed = Object.entries(checks)
      .filter(([, ok]) => !ok)
      .map(([name]) => name);
    const verdict = failed.length === 0 ? "VERIFIED" : "NOT VERIFIED";

    let video = null;
    if (frames.length >= 3) {
      const webm = join(outDir, "zoom.webm");
      video = await encodeVideo(frameDir, webm);
    }

    const report = {
      verdict,
      failed,
      checks,
      url,
      ready,
      restProbe,
      zoom: mid,
      midPixels,
      layoutCountDelta,
      recalcStyleDelta,
      screenshots: {
        rest: ready?.ok ? restPng : null,
        zoomMid: ready?.ok ? midPng : null,
        zoomEnd: ready?.ok ? endPng : null,
      },
      video,
      frameCount: frames.length,
      chromeErr: chromeErr.slice(0, 500),
    };
    writeFileSync(join(outDir, "report.json"), JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report));
    browser.ws.close();
    if (failed.length) process.exitCode = 1;
  } finally {
    chrome.kill("SIGTERM");
  }
}

function encodeVideo(frameDir, outFile) {
  return new Promise((resolve) => {
    const ffmpeg = spawn(
      "ffmpeg",
      [
        "-y",
        "-framerate",
        "8",
        "-pattern_type",
        "glob",
        "-i",
        join(frameDir, "frame-*.jpg"),
        "-c:v",
        "libvpx",
        "-b:v",
        "600k",
        outFile,
      ],
      { stdio: ["ignore", "pipe", "pipe"] }
    );
    ffmpeg.on("close", (code) => {
      resolve(code === 0 && existsSync(outFile) ? outFile : null);
    });
    ffmpeg.on("error", () => resolve(null));
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
