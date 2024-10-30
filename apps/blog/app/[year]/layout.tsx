import React from 'react'

import Container from '@duyet/components/Container'
import Header from '@duyet/components/Header'

interface YearLayoutProps {
  params: Promise<{
    year: number
  }>
  children: React.ReactNode | React.ReactNode[]
}

export default function YearLayout({ children }: YearLayoutProps) {
  return (
    <>
      <Header />
      <Container>{children}</Container>
    </>
  )
}
