import type { ChartConfig } from "./types";

// Helper to extract the key from a payload.
export function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined;
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined;

  let configLabelKey: string = key;

  if (key in config || (payloadPayload && configLabelKey in payloadPayload)) {
    configLabelKey = key;
  } else if (payloadPayload) {
    configLabelKey = Object.keys(payloadPayload)[0];
  }

  return configLabelKey ? config[configLabelKey] : config[key];
}
