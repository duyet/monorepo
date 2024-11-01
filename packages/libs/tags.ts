/**
 * Normalizes the tags. e.g. "JavaScript" => "Javascript", "JavaScript framework" => "Javascript Framework", ...
 *
 * @param tag string
 */
export function normalizeTag(tag: string): string {
  const normalizedTag = tag
    .split(' ')
    .filter((word) => word.length > 0)
    .map((word) => {
      return word[0].toUpperCase() + word.toLowerCase().substring(1)
    })
    .join(' ')

  return normalizedTag
}
