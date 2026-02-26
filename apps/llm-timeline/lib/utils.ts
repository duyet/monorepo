import type { Model } from './data'

export interface FilterState {
  search: string
  license: 'all' | 'open' | 'closed' | 'partial'
  type: 'all' | 'model' | 'milestone'
  org: string
}

/**
 * Filter models based on search and filter criteria
 */
export function filterModels(models: Model[], filters: FilterState): Model[] {
  return models.filter((model) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      const matchesSearch =
        model.name.toLowerCase().includes(searchLower) ||
        model.org.toLowerCase().includes(searchLower) ||
        model.desc.toLowerCase().includes(searchLower)
      if (!matchesSearch) return false
    }

    // License filter
    if (filters.license !== 'all' && model.license !== filters.license) {
      return false
    }

    // Type filter
    if (filters.type !== 'all' && model.type !== filters.type) {
      return false
    }

    // Organization filter
    if (filters.org && model.org !== filters.org) {
      return false
    }

    return true
  })
}

/**
 * Group models by year
 */
export function groupByYear(models: Model[]): Map<number, Model[]> {
  const groups = new Map<number, Model[]>()

  for (const model of models) {
    const year = new Date(model.date).getFullYear()
    const existing = groups.get(year) || []
    existing.push(model)
    groups.set(year, existing)
  }

  // Sort each group by date (newest first)
  groups.forEach((yearModels, year) => {
    groups.set(
      year,
      yearModels.sort((a: Model, b: Model) => new Date(b.date).getTime() - new Date(a.date).getTime())
    )
  })

  return groups
}

/**
 * Format date for display
 */
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/**
 * Get color for license type
 */
export function getLicenseColor(license: Model['license']): string {
  switch (license) {
    case 'open':
      return 'bg-sage-light text-sage-dark border-sage'
    case 'closed':
      return 'bg-coral-light text-coral-dark border-coral'
    case 'partial':
      return 'bg-lavender-light text-lavender-dark border-lavender'
  }
}

/**
 * Get color for model type
 */
export function getTypeColor(type: Model['type']): string {
  switch (type) {
    case 'milestone':
      return 'bg-terracotta-light text-terracotta-dark border-terracotta'
    case 'model':
      return 'bg-oat-light text-neutral-700 border-oat'
  }
}

/**
 * Group models by organization
 * Sorted by model count descending; within each org sorted by date descending
 */
export function groupByOrg(models: Model[]): Map<string, Model[]> {
  const groups = new Map<string, Model[]>()

  for (const model of models) {
    const existing = groups.get(model.org) || []
    existing.push(model)
    groups.set(model.org, existing)
  }

  // Sort each group by date descending
  groups.forEach((orgModels, org) => {
    groups.set(
      org,
      orgModels.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    )
  })

  // Return map sorted by model count descending
  return new Map(
    Array.from(groups.entries()).sort(([, a], [, b]) => b.length - a.length)
  )
}

/**
 * Calculate statistics from models
 */
export function getStats(models: Model[]) {
  return {
    total: models.length,
    models: models.filter(m => m.type === 'model').length,
    milestones: models.filter(m => m.type === 'milestone').length,
    organizations: new Set(models.map(m => m.org)).size,
    years: new Set(models.map(m => new Date(m.date).getFullYear())).size,
    open: models.filter(m => m.license === 'open').length,
    closed: models.filter(m => m.license === 'closed').length,
  }
}

/**
 * Convert string to URL-safe slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
