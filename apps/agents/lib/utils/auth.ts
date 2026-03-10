/**
 * Shared authentication utilities
 */

/**
 * Build auth headers from a token getter.
 * Returns empty headers on any error.
 *
 * @param getToken - Optional async function that returns a bearer token
 * @returns Headers object with Authorization if token available
 */
export async function getAuthHeaders(
  getToken?: () => Promise<string | null>
): Promise<Record<string, string>> {
  if (!getToken) return {};
  try {
    const token = await getToken();
    if (!token) return {};
    return { Authorization: `Bearer ${token}` };
  } catch {
    return {};
  }
}
