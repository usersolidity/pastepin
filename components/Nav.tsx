import Link from 'next/link'
import React from 'react'

interface Props {
  title?: string
}

export default function Layout({ title = 'Pastepin' }: Props) {
  return (
    <nav>
      <Link href="/">
        <a>
          <div className="logo">📌</div>
        </a>
      </Link>
      <h1>{title}</h1>
      {/* <h5>Share content permissionlessly on IPFS</h5> */}
    </nav>
  )
}
