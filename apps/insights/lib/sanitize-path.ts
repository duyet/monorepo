/**
 * Strip directory structure so machine/project labels can't leak absolute
 * paths or user-identifying directory names when rendered on the dashboard.
 *
 * Both WakaTime breakdowns and ClickHouse session/project rows carry path-like
 * labels, so the redaction lives in one place.
 */
export function sanitizePathLabel(value: unknown): string {
  const raw = value == null ? "" : String(value);
  if (!raw) return "Unknown";
  const parts = raw.split(/[\\/]/).filter(Boolean);
  return parts[parts.length - 1] || "Unknown";
}
