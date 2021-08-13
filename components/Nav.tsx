import Link from 'next/link'
import React from 'react'

interface Props {}

export default function Layout({}: Props) {
  return (
    <nav>
      <Link href="/">
        <a>
          <h4>📌 Pastepin</h4>
        </a>
      </Link>
      <h5>Share content permissionlessly on IPFS</h5>
    </nav>
  )
}
