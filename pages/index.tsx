import Link from 'next/link'
import React from 'react'

export default function IndexPage() {
  return (
    <section className="py-20 px-4 md:px-16 text-center space-y-8">
      <h1 className="text-7xl font-bold">Pastepin</h1>
      <div className="rounded-full bg-red-200 w-16 h-16 flex justify-center items-center text-3xl mx-auto select-none">
        📍
      </div>
      <h1 className="text-4xl font-bold text-gray-800">
        Decentralized Pastebin
      </h1>
      <h2 className="text-2xl font-semibold text-gray-600">
        Share Text and Files on a Decentralized Network
      </h2>
      <div>
        <p className="text-gray-400 text-sm">
          *your data will be stored on the{' '}
          <a
            href="https://ipfs.io/"
            target="_blank"
            rel="noreferrer"
            className="underline text-gray-500"
          >
            IPFS network
          </a>
        </p>
        <p className="text-gray-400 text-sm">
          **everyone with a link will be able to see your post
        </p>
      </div>
      <Link href="/new">
        <a className="inline-block shadow-md rounded-2xl bg-blue-500 text-white font-semibold leading-none py-5 px-5 outline-none select-none">
          Start
        </a>
      </Link>
      <div className="flex">
        <div className="grid grid-cols-2 mx-auto mt-5 gap-8">
          <div className="w-40 h-40 md:w-48 md:h-48 p-5 bg-purple-100 text-purple-900 text-opacity-75 rounded-3xl text-md md:text-xl font-semibold flex flex-col justify-around items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            Markdown Support
          </div>
          <div className="w-40 h-40 md:w-48 md:h-48 p-5 bg-yellow-100 text-yellow-900 text-opacity-75 rounded-3xl text-md md:text-xl font-semibold flex flex-col justify-around items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Authentication using Signature
          </div>
          <div className="w-40 h-40 md:w-48 md:h-48 p-5 bg-blue-100 text-blue-900 text-opacity-75 rounded-3xl text-md md:text-xl font-semibold flex flex-col justify-around items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
              />
            </svg>
            Upload Files
          </div>
          <div className="w-40 h-40 md:w-48 md:h-48 p-5 bg-red-100 text-red-900 text-opacity-75 rounded-3xl text-md md:text-xl font-semibold flex flex-col justify-around items-center">
            <div className="text-6xl text-opacity-60 tracking-tight">⌘+/</div>
            Toggle Preview
          </div>
        </div>
      </div>
      <footer className="text-center text-sm text-gray-700">
        <p>
          Made with{' '}
          <a
            href="https://web3.storage/"
            target="_blank"
            rel="noreferrer"
            style={{ color: 'rgb(255, 89, 77)' }}
            className="underline"
          >
            web3.storage
          </a>{' '}
          during the HackFS hackathon.
        </p>
        <a
          href="https://github.com/0xMartian/pastepin"
          target="_blank"
          rel="noreferrer"
          className="underline text-blue-500 mt-2 inline-block"
        >
          GitHub
        </a>
      </footer>
    </section>
  )
}
