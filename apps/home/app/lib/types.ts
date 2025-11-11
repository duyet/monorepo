import { ComponentType } from 'react'

export type CardVariant =
  | 'default'
  | 'elevated'
  | 'outlined'
  | 'glass'
  | 'gradient'

export interface LinkCardData {
  icon: ComponentType
  title: string
  description: string
  url: string
  color?: string
  iconColor?: string
  featured?: boolean
  backgroundImage?: string
  variant?: CardVariant
}

export interface SkillData {
  name: string
  link?: string
}
