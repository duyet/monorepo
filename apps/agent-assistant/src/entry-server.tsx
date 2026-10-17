import {
  createStartHandler,
  defaultStreamHandler,
} from "@tanstack/react-start/server";
import { ThreadStateDO } from "./durable-object";

export default createStartHandler(defaultStreamHandler);

// Wrangler requires Durable Object classes to be exported from the Worker
// entrypoint (main module). ThreadStateDO lives in ./durable-object.ts.
export { ThreadStateDO };
