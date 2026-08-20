/** Marker set by the splat route so the Worker can emit HTTP 404. */
export const NOT_FOUND_HEADER = "X-News-Not-Found";

/**
 * Start's HTML stream is always 200 unless throw notFound() — and that
 * skips the splat head(). Rewrite only when the splat marked the response.
 */
export function applyNotFoundHttpStatus(res: Response): Response {
  if (res.status !== 200) return res;
  if (res.headers.get(NOT_FOUND_HEADER) !== "1") return res;
  const headers = new Headers(res.headers);
  headers.delete(NOT_FOUND_HEADER);
  return new Response(res.body, {
    status: 404,
    statusText: "Not Found",
    headers,
  });
}
