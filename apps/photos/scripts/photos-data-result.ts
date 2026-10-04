/**
 * Exit code for the photos prebuild.
 * An empty list is a failed publish only when a provider token was configured.
 * With no token, the script keeps the empty-file fallback and exits 0.
 */
export function photosDataExitCode(
  photos: readonly unknown[],
  tokenConfigured: boolean,
): 0 | 1 {
  if (photos.length === 0 && tokenConfigured) return 1;
  return 0;
}
