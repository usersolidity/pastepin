import Link from 'next/link'
import React from 'react'

interface Props {
  title?: string
}

export default function Layout({ title = 'Pastepin' }: Props) {
  return (
    <section className="fixed top-0 left-0 w-full z-20">
      <nav className="center flex items-baseline py-5">
        <Link href="/">
          <a>
            <div className="rounded-full bg-red-300 w-12 h-12 flex justify-center items-center text-2xl mr-3">
              📌
            </div>
          </a>
        </Link>
        <h1 className="text-2xl font-semibold text-gray-600">{title}</h1>
        {/* <h5>Share content permissionlessly on IPFS</h5> */}
      </nav>
    </section>
  )
}
