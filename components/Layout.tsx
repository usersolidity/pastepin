import React from 'react'
import User from './User'

interface Props {
  children: React.ReactNode
}

export default function Layout({ children }: Props) {
  return (
    <main>
      <User />
      {children}
    </main>
  )
}
