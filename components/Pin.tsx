import { Web3Provider } from '@ethersproject/providers'
import { useRouter } from 'next/dist/client/router'
import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Web3Storage } from 'web3.storage'
import { baseUrl } from '../lib'
import Markdown from './Markdown'

export const METADATA_FILENAME = 'pastebin.json'

export interface Pastepin {
  content: string
  title?: string
  address?: string
  signature?: string
}

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_TOKEN as string,
})

interface Props {}

export default function Pin({}: Props) {
  const router = useRouter()
  // turns false while publishing
  const [state, setState] = useState<'edit' | 'preview' | 'publish'>('edit')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')

  // react-dropzone
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([])
  const onDrop = useCallback((acceptedFiles) => {
    // @ts-ignore
    setAcceptedFiles((prev) => [...prev, ...acceptedFiles])
  }, [])
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop,
  })

  // publish
  const onSubmit = useCallback(
    async (sign: boolean) => {
      if (content.length <= 0) return
      const pastepin: Pastepin = { content, title }

      if (sign) {
        const provider = new Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        pastepin.signature = await signer.signMessage(content)
        pastepin.address = await signer.getAddress()
      }

      console.log({ pastepin })
      const blob = new Blob([JSON.stringify(pastepin)], {
        type: 'application/json',
      })

      const files = [...acceptedFiles, new File([blob], METADATA_FILENAME)]

      // upload files using web3.storage
      console.log('storing', files)
      const cid = await client.put(files)

      const path = `/${cid}`
      console.log('stored', baseUrl + path)

      // copy link to clipboard
      await navigator.clipboard.writeText(baseUrl + path)

      // redirect to pin /[pin].tsx (takes a while)
      router.push(path)
    },
    [acceptedFiles, content, router, title],
  )

  return (
    <section
      {...getRootProps()}
      className="relative h-screen overflow-hidden"
      onKeyDown={(e) => {
        // preview on `meta + enter`
        if (state === 'edit' && e.metaKey && e.key === 'Enter') {
          e.preventDefault()
          setState('preview')
        } // edit on `meta + e`
        else if (state === 'preview' && e.metaKey && e.key === 'e') {
          e.preventDefault()
          setState('edit')
        }
      }}
    >
      <input {...getInputProps()} />
      {isDragActive && <div>Come to papa</div>}

      {state === 'preview' && (
        <button onClick={() => setState('edit')}>🖊 Edit</button>
      )}

      {/* todo: if empty show posts */}
      {state === 'edit' ? (
        <textarea
          className="w-full h-full resize-none outline-none center pt-32"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={CONTENT_PLACEHOLDER}
        />
      ) : (
        <div onDoubleClick={() => setState('edit')}>
          <Markdown>{content}</Markdown>
        </div>
      )}

      <div className="absolute z-10 left-1/2 -translate-x-1/2 bottom-7">
        {state === 'edit' && (
          <button
            onClick={() => {
              setState('preview')
            }}
            className="button"
          >
            Preview
          </button>
        )}
        {state === 'preview' && (
          <>
            <input
              autoFocus
              className="block text-2xl font-bold outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title"
            />
            <button onClick={() => onSubmit(true)} className="publish">
              Sign using Ethereum
            </button>
            <button onClick={() => onSubmit(false)} className="publish">
              Publish Anonymously
            </button>
          </>
        )}
        {state === 'publish' && <button>Copy Url</button>}
      </div>

      <ul className="">
        {acceptedFiles.map((file, i) => (
          <li key={i} className="">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8 4a3 3 0 00-3 3v4a5 5 0 0010 0V7a1 1 0 112 0v4a7 7 0 11-14 0V7a5 5 0 0110 0v4a3 3 0 11-6 0V7a1 1 0 012 0v4a1 1 0 102 0V7a3 3 0 00-3-3z"
                clipRule="evenodd"
              />
            </svg>
            {file.name} - {file.size} bytes — {file.lastModified} modified —{' '}
            {file.type} type
          </li>
        ))}
      </ul>
    </section>
  )
}

const CONTENT_PLACEHOLDER = `\
# Use markdown formatting
`
