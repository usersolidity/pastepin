import { Web3Provider } from '@ethersproject/providers'
import { useAtom } from 'jotai'
import { useRouter } from 'next/dist/client/router'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Web3Storage } from 'web3.storage'
import Web3Modal from 'web3modal'
import { stateAtom, titleAtom } from '../lib/atoms'
import { baseUrl } from '../lib/utils'
import Markdown from './Markdown'

export const METADATA_FILENAME = 'pastepin.json'

export interface Pastepin {
  content: string
  title: string
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
  const [redirectText, setRedirectText] = useState('')

  // react-dropzone
  const [acceptedFiles, setAcceptedFiles] = useState<File[]>([])
  const onDrop = useCallback((acceptedFiles) => {
    // @ts-ignore
    setAcceptedFiles((prev) => [...prev, ...acceptedFiles])
  }, [])
  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop,
  })

  // publish
  const onSubmit = useCallback(
    async (sign: boolean) => {
      if (!title || !content) return
      console.log('submiting')
      const pastepin: Pastepin = { content, title }

      if (sign) {
        const web3Modal = new Web3Modal({
          network: 'mainnet', // optional
          cacheProvider: true, // optional
          providerOptions: {},
        })

        const web3Provider = await web3Modal.connect()
        const provider = new Web3Provider(web3Provider)
        const signer = provider.getSigner()
        pastepin.signature = await signer.signMessage(content)
        pastepin.address = await signer.getAddress()
      }

      console.log({ pastepin })
      const blob = new Blob([JSON.stringify(pastepin)], {
        type: 'application/json',
      })

      const files = [...acceptedFiles, new File([blob], METADATA_FILENAME)]

      // hides floating buttons
      setState('redirect')

      // upload files using web3.storage
      console.log('storing', files)
      const cid = await client.put(files)

      const path = `/${cid}`
      console.log('stored', baseUrl + path)
      setRedirectText(baseUrl + path)

      // redirect to pin /[pin].tsx (takes a while)
      router.push(path)
    },
    [acceptedFiles, content, router, setState, title],
  )

  return (
    <section
      {...getRootProps()}
      className="relative h-screen"
      tabIndex={0} // make onKeyDown work
      onKeyDown={(e) => {
        // preview on `meta + enter`
        if (state === 'edit' && e.metaKey && e.key === '/') {
          e.preventDefault()
          setState('preview')
        } // edit on `meta + e`
        else if (state === 'preview' && e.metaKey && e.key === '/') {
          e.preventDefault()
          setState('edit')
        }
      }}
    >
      <input {...getInputProps()} />
      {isDragActive && (
        <div className="fixed inset-0 w-full h-full bg-blue-100 border border-blue-400 overflow-hidden opacity-50" />
      )}

      {state === 'edit' ? (
        <textarea
          className="w-full h-full resize-none outline-none center py-32 -mt-2 text-lg" // -mt-2 fixing small overflow
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={CONTENT_PLACEHOLDER}
        />
      ) : (
        <div className="h-full" onDoubleClick={() => setState('edit')}>
          <Markdown>{content}</Markdown>
        </div>
      )}

      <div className="fixed z-10 left-1/2 -translate-x-1/2 bottom-20 flex justify-center flex-wrap">
        <ul className="w-full h-full flex flex-wrap justify-center mb-3">
          {acceptedFiles.map((file, i) => (
            <li
              key={i}
              style={{ maxWidth: '169px' }}
              className="group relative bg-gray-50 rounded-md px-2 py-1 h-full m-1 shadow-sm cursor-pointer"
              onClick={() => {
                setAcceptedFiles(acceptedFiles.filter((_, j) => i !== j))
              }}
            >
              <div className="overflow-hidden whitespace-nowrap overflow-ellipsis text-xs text-gray-700 select-none">
                {file.name}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="hidden group-hover:block h-5 w-5 absolute right-1 top-1/2 -translate-y-1/2 text-gray-600 bg-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </li>
          ))}
        </ul>

        {state === 'edit' && (
          <div className="shadow-md rounded-2xl bg-blue-500 text-white flex">
            <div
              className="px-5 cursor-pointer h-full w-full flex items-center justify-center"
              onClick={open}
            >
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
            </div>
            <button
              onClick={() => {
                setState('preview')
              }}
              className="flex items-center justify-center font-semibold leading-none py-5 px-7 select-none border-l border-blue-600"
            >
              Preview
            </button>
          </div>
        )}

        {state === 'preview' && (
          <div className="flex rounded-2xl overflow-hidden shadow-sm">
            <button
              onClick={() => setState('edit')}
              className="w-full flex items-center justify-center text-gray-600 font-semibold leading-none bg-gray-100 py-5 px-7 outline-none select-none"
            >
              Edit
            </button>
            <button
              onClick={() => onSubmit(false)}
              className="w-full inline-flex items-center justify-center text-blue-700 font-semibold leading-none bg-blue-200 py-5 px-5 outline-none select-none"
            >
              Publish
            </button>
            <button
              onClick={() => onSubmit(true)}
              className="w-full inline-flex items-center justify-center text-yellow-700 font-semibold leading-none bg-yellow-200 py-5 px-7 outline-none select-none"
            >
              Sign
            </button>
          </div>
        )}

        {state === 'redirect' && redirectText && (
          <div className="relative bg-blue-50 rounded-2xl shadow-md p-3 text-blue-800 text-opacity-50 max-w-xs overflow-hidden whitespace-nowrap overflow-ellipsis text-sm font-semibold">
            {redirectText}
            {redirectText !== 'Copied!' && (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-7 w-7 absolute right-3 top-1/2 -translate-y-1/2 bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 p-1 rounded-full cursor-pointer transition"
                viewBox="0 0 20 20"
                fill="currentColor"
                onClick={async () => {
                  await navigator.clipboard.writeText(redirectText)
                  setRedirectText('Copied!')
                }}
              >
                <path d="M7 9a2 2 0 012-2h6a2 2 0 012 2v6a2 2 0 01-2 2H9a2 2 0 01-2-2V9z" />
                <path d="M5 3a2 2 0 00-2 2v6a2 2 0 002 2V5h8a2 2 0 00-2-2H5z" />
              </svg>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

const CONTENT_PLACEHOLDER = `\
# Heading 1
## Heading 2

*Italic* & **Bold**

\`\`\`js
console.log('Hello world')
\`\`\`

[Pastepin](https://pastepin.xyz)

As Grace Hopper said:
> I’ve always been more interested

- Item 1
 - Item 2

1. Item 1
2. Item 2
`
