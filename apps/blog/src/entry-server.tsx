import {
  createStartHandler,
  defaultRenderHandler,
} from "@tanstack/react-start/server";

// Complete HTML per request (no streamed empty <main>). Public posts are
// prerendered at build; this keeps vite dev / SSR from painting chrome first.
export default createStartHandler(defaultRenderHandler);
