import { Web3Provider } from '@ethersproject/providers'
import { useRouter } from 'next/dist/client/router'
import React, { useCallback, useState } from 'react'
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
      className="editor"
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

      {state === 'edit' ? (
        <textarea
          className="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={CONTENT_PLACEHOLDER}
        />
      ) : (
        <div onDoubleClick={() => setState('edit')}>
          <Markdown>{content}</Markdown>
        </div>
      )}

      <div className="floating">
        {state === 'edit' && (
          <button
            onClick={() => {
              setState('preview')
            }}
            className="button floating"
          >
            Preview
          </button>
        )}
        {state === 'preview' && (
          <>
            <input
              autoFocus
              className="title"
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

      <ul className="floating">
        {acceptedFiles.map((file, i) => (
          <li key={i}>
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
