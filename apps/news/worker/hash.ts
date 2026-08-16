/** Canonical item id: sha256 hex of the item's URL. Shared by the ingest
 * workflow (hashing freshly-fetched items) and the submissions pipeline
 * (hashing a user-submitted URL the same way, so an accepted submission
 * lands under the same id a normal fetch would have produced). */
export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
