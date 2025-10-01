import type { CCUsageProjectData } from '../types'

/**
 * Anonymize project paths to generic names like "Project A", "Project B"
 */
export function anonymizeProjects(
  projects: Record<string, unknown>[],
): CCUsageProjectData[] {
  if (!Array.isArray(projects) || projects.length === 0) return []

  const totalTokens = projects.reduce(
    (sum, p) => sum + (Number(p.total_tokens) || 0),
    0,
  )

  return projects
    .slice(0, 15) // Top 15 projects only
    .map((project, index) => ({
      projectName: `Project ${String.fromCharCode(65 + index)}`, // A, B, C, ...
      tokens: Number(project.total_tokens) || 0,
      relativeUsage:
        totalTokens > 0
          ? Math.round(
              ((Number(project.total_tokens) || 0) / totalTokens) * 100,
            )
          : 0,
      lastActivity: String(project.last_activity) || 'Unknown',
    }))
}

/**
 * Distribute percentages to ensure they sum to exactly 100%
 * Uses the largest remainder method for fair distribution
 */
export function distributePercentages(rawPercentages: number[]): number[] {
  if (rawPercentages.length === 0) return []

  // Handle edge cases
  const totalRaw = rawPercentages.reduce((sum, p) => sum + p, 0)
  if (totalRaw === 0) return rawPercentages.map(() => 0)

  // Step 1: Calculate integer parts and remainders
  const items = rawPercentages.map((percentage, index) => ({
    index,
    integer: Math.floor(percentage),
    remainder: percentage - Math.floor(percentage),
  }))

  // Step 2: Sum the integer parts
  const sumIntegers = items.reduce((sum, item) => sum + item.integer, 0)

  // Step 3: Distribute the remaining units (to reach 100)
  const remainingUnits = 100 - sumIntegers

  // Step 4: Sort by remainder (descending) and distribute remaining units
  const sortedByRemainder = [...items].sort((a, b) => b.remainder - a.remainder)

  const result = new Array(rawPercentages.length).fill(0)

  // Assign integer parts
  items.forEach((item) => {
    result[item.index] = item.integer
  })

  // Distribute remaining units to items with largest remainders
  for (let i = 0; i < remainingUnits && i < sortedByRemainder.length; i++) {
    result[sortedByRemainder[i].index] += 1
  }

  return result
}
