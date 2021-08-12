import { Web3Provider } from '@ethersproject/providers'
import { useRouter } from 'next/dist/client/router'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Web3Storage } from 'web3.storage'
import { baseUrl } from '../lib'

export const METADATA_NAME = 'metadata.json'

interface Pastepin {
  fileName: string
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
  const [state, setState] = useState<'editing' | 'publishing' | 'redirecting'>(
    'editing',
  )
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
      const fileName = `${title.length > 0 ? title : 'pastepin'}.html`
      const pastepin: Pastepin = { fileName }

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
      // todo: generate & append html
      const files = [...acceptedFiles, new File([blob], METADATA_NAME)]

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
    <section {...getRootProps()} className="editor">
      <input {...getInputProps()} />
      {isDragActive && <div>Come to papa</div>}

      <input
        className="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title"
      />
      <textarea
        className="content"
        placeholder={CONTENT_PLACEHOLDER}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={(e) => {
          // publish on meta + enter
          if (e.metaKey && e.key === 'Enter') {
            e.preventDefault()
            e.stopPropagation()
            onSubmit(false)
          }
        }}
      />

      <div className="floating">
        {state === 'editing' && (
          <button
            onClick={() => {
              setState('publishing')
            }}
            className="button floating"
          >
            Preview
          </button>
        )}
        {state === 'publishing' && (
          <div className="floating">
            <button onClick={() => onSubmit(true)} className="publish">
              Sign using Ethereum
            </button>
            <button onClick={() => onSubmit(false)} className="publish">
              Publish Anonymously
            </button>
          </div>
        )}
        {state === 'redirecting' && <button>Copy Url</button>}
      </div>

      <ul>
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
