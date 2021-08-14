import { Web3Provider } from '@ethersproject/providers'
import { useAtom } from 'jotai'
import { useRouter } from 'next/dist/client/router'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Web3Storage } from 'web3.storage'
import { stateAtom, titleAtom } from '../lib/atoms'
import { baseUrl } from '../lib/utils'
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
  const [state, setState] = useAtom(stateAtom)
  const [title] = useAtom(titleAtom)
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
      className="relative h-screen"
      tabIndex={0} // make onKeyDown work
      onKeyDown={(e) => {
        console.log({ state })

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

      {/* todo: if empty show help & recent posts */}
      {state === 'edit' ? (
        <textarea
          className="w-full h-full resize-none outline-none center py-32 -mt-2" // -mt-2 fixing small overflow
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={CONTENT_PLACEHOLDER}
        />
      ) : (
        <div onDoubleClick={() => setState('edit')}>
          <Markdown>{content}</Markdown>
        </div>
      )}

      <div className="absolute z-10 left-1/2 -translate-x-1/2 bottom-20">
        {state === 'edit' && (
          <button
            onClick={() => {
              setState('preview')
            }}
            className="rounded-2xl w-full sm:w-auto inline-flex items-center justify-center text-white font-semibold leading-none bg-blue-500 shadow-lg py-5 px-5"
          >
            Preview
          </button>
        )}
        {state === 'preview' && (
          <>
            <div className="flex rounded-2xl overflow-hidden shadow-xl">
              <button
                onClick={() => setState('edit')}
                className="w-full flex items-center justify-center text-gray-600 font-semibold leading-none bg-gray-100 py-5 px-6 outline-none"
              >
                Edit
              </button>
              <button
                onClick={() => onSubmit(false)}
                className="w-full inline-flex items-center justify-center text-blue-700 font-semibold leading-none bg-blue-200 py-5 px-4 outline-none"
              >
                Publish
              </button>
              <button
                onClick={() => onSubmit(true)}
                className="w-full inline-flex items-center justify-center text-yellow-700 font-semibold leading-none bg-yellow-200 py-5 px-6 outline-none"
              >
                Sign
              </button>
            </div>
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
