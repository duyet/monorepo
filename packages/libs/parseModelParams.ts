/**
 * Parse model parameter string (e.g., "1.5B", "70M", "small") to numeric value in billions
 * @example
 * parseParamValue("1.5B") // 1500000000
 * parseParamValue("70M") // 70000000
 * parseParamValue("1B") // 1000000000
 * parseParamValue("~1.5B") // 1500000000
 * parseParamValue("small") // null (unknown size)
 */
export function parseParamValue(params: string | null): number | null {
  if (!params) return null;

  const cleaned = params.replace(/^[~<>≈]/, "").trim();
  const match = cleaned.match(/^([\d.]+)([KMBT])/i);
  if (!match) return null;

  const value = parseFloat(match[1]);
  const unit = match[2].toUpperCase();

  let billions = value;
  if (unit === "K") billions = value / 1e6;
  else if (unit === "M") billions = value / 1e3;
  else if (unit === "T") billions = value * 1000;

  return billions;
}

/**
 * Get parameter bucket category from parameter value
 * @example
 * getParamsBucket("1.5B") // "xl"
 * getParamsBucket("500M") // "medium"
 * getParamsBucket("small") // "small"
 */
export function getParamsBucket(params: string | null): string {
  if (!params) return "unknown";

  const billions = parseParamValue(params);
  if (billions === null) return params; // Return as-is for non-numeric values like "small", "medium"

  if (billions < 1) return "small";
  if (billions < 10) return "medium";
  if (billions < 100) return "large";
  return "xl";
}
