import React from 'react'

interface LayoutProps {
  cloudflare: React.ReactNode
  wakatime: React.ReactNode
}

export default async function Layout({ cloudflare, wakatime }: LayoutProps) {
  return (
    <>
      {cloudflare}
      {wakatime}
    </>
  )
}
