import React from 'react'
import { Container } from '@duyet/components'

interface YearLayoutProps {
  params: {
    year: number
  }
  children: React.ReactNode
}

export default function YearLayout({ children }: YearLayoutProps) {
  return <Container>{children}</Container>
}
