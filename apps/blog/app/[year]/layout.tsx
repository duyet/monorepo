import Container from '@duyet/components/Container'
import Header from '@duyet/components/Header'
import React from 'react'

interface YearLayoutProps {
  params: {
    year: number
  }
  children: React.ReactNode
}

export default function YearLayout({ children }: YearLayoutProps) {
  return (
    <>
      <Header />
      <Container>{children}</Container>
    </>
  )
}
