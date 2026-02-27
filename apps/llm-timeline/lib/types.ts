/**
 * Extended type definitions for LLM Timeline data
 * Supports both curated and Epoch.ai data sources
 */

export interface Model {
  name: string
  date: string // YYYY-MM-DD
  org: string
  params: string | null // e.g., "175B", "1.8T (MoE)"
  type: 'model' | 'milestone'
  license: 'open' | 'closed' | 'partial'
  desc: string
  source?: 'curated' | 'epoch' // Track data source
  epoch?: EpochMetadata // Optional epoch.ai metadata
}

export interface EpochMetadata {
  domain?: string
  task?: string
  approach?: string
  trainingCompute?: number // FLOP
  trainingHardware?: string
  trainingDataset?: string
  modelAccessibility?: string
  link?: string
  authors?: string
}

export interface MergeStats {
  curated: number
  epoch: number
  duplicates: number
  total: number
}
