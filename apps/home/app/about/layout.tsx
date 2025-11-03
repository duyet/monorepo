import Header from '@duyet/components/Header'
import * as React from 'react'

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      {children}
    </>
  )
}
