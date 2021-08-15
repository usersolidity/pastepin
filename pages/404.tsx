import { useRouter } from 'next/router'
import React from 'react'
import Nav from '../components/Nav'

export default function Home() {
  const router = useRouter()
  return (
    <>
      <Nav />
      <main className="min-h-screen flex flex-col items-center justify-center space-y-10">
        <h1 className="text-9xl font-semibold block">404</h1>
        <button
          onClick={() => router.push('/new')}
          className="shadow-md rounded-2xl bg-blue-500 text-white font-semibold leading-none py-5 px-5 outline-none select-none"
        >
          New
        </button>
      </main>
    </>
  )
}
