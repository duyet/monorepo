import type { ImageProps } from 'next/image'
import type { ReactNode } from 'react'

export interface ContactLink {
  id: string
  type: 'email' | 'website' | 'github' | 'linkedin' | 'custom'
  label: string
  url: string
  displayText?: string
  hoverContent?: {
    icon?: ReactNode
    title: string
    subtitle: string
  }
}

export interface PersonalInfo {
  name: string
  title: string
  email: string
  overview: string
  contacts: ContactLink[]
}

export interface Responsibility {
  id: number
  item: string | ReactNode
}

export interface Experience {
  id: string
  title: string
  company: string
  companyUrl?: string
  companyLogo?: ImageProps['src']
  companyLogoClassName?: string
  from: Date
  to?: Date
  responsibilities: Responsibility[]
}

export interface Education {
  id: string
  major: string
  university: string
  period?: string
  thesis: string
  thesisUrl: string
}

export interface SkillDetail {
  id: string
  name: string
  url?: string
  icon?: ReactNode
  note?: string | ReactNode
}

export interface SkillCategory {
  id: string
  name: string
  skills: SkillDetail[]
}

export interface CVData {
  personal: PersonalInfo
  experience: Experience[]
  education: Education[]
  skills: SkillCategory[]
}

// For generating llms.txt
export interface LLMsInfo {
  name: string
  role: string
  email: string
  website: string
  bio: string
  expertise: string[]
  currentRole: {
    title: string
    company: string
    duration: string
  }
  keyAchievements: string[]
  technologies: string[]
  links: {
    github: string
    blog: string
    linkedin: string
  }
}