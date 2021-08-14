import { useAtom } from 'jotai'
import Link from 'next/link'
import React, { useEffect } from 'react'
import { stateAtom, titleAtom } from '../lib/atoms'

interface Props {
  title?: string
}

export const focusTitle = () =>
  (document.querySelector('#title') as HTMLInputElement)?.focus()

export default function Nav({}: Props) {
  const [state] = useAtom(stateAtom)
  const [title, setTitle] = useAtom(titleAtom)

  useEffect(() => {
    if (state === 'preview') focusTitle()
  }, [state])

  return (
    <section className="fixed top-0 left-0 w-full z-20">
      <nav className="center flex items-baseline py-5">
        <Link href="/">
          <a>
            <div className="rounded-full bg-red-200 w-12 h-12 flex justify-center items-center text-2xl mr-3">
              📍
            </div>
          </a>
        </Link>
        {state === 'preview' || title.length ? (
          <input
            id="title"
            className="text-2xl font-semibold text-gray-600 outline-none bg-transparent"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
          />
        ) : (
          <h1 className="text-2xl font-semibold text-gray-600">Pastepin</h1>
        )}
      </nav>
    </section>
  )
}
