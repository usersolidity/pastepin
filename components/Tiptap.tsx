import { Web3Provider } from '@ethersproject/providers'
import { EditorContent, Extension, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useRouter } from 'next/dist/client/router'
import React, { useCallback, useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Web3Storage } from 'web3.storage'
import { baseUrl } from '../lib'

export const CONTENT_FILE_NAME = 'content.html'
export const SIGNATURE_FILE_NAME = 'signature.json'

const DEFAULT_CONTENT =
  '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h4>Heading 4</h4><h5>Heading 5</h5><h6>Heading 6<br></h6>'

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_TOKEN as string,
})

interface Signature {
  address: string
  signature: string
}

interface Props {
  content?: string
}

export default function Tiptap({ content = DEFAULT_CONTENT }: Props) {
  const router = useRouter()
  const editor = useEditor({
    extensions: [StarterKit.configure({ dropcursor: false }), DisableModEnter],
    content,
    autofocus: 'end',
  })
  // turns false while publishing
  const [state, setState] = useState<'editing' | 'publishing' | 'redirecting'>(
    'editing',
  )

  // dropzone
  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      noClick: true,
      noKeyboard: true,
    })

  // update state
  useEffect(() => {
    if (state !== 'editing') editor?.setEditable(false)
  }, [state, editor])

  // publish
  const onSubmit = useCallback(
    async (sign: boolean) => {
      if (!editor) return
      const content = editor.getHTML()
      const contentBlob = new Blob([content], { type: 'text/html' })

      const files = [
        ...acceptedFiles,
        new File([contentBlob], CONTENT_FILE_NAME),
      ]

      if (sign) {
        const provider = new Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const message = 'yay'
        const signature: Signature = {
          signature: await signer.signMessage(message),
          address: await signer.getAddress(),
        }
        console.log(signature)
        const signatureBlob = new Blob([JSON.stringify(signature)], {
          type: 'application/json',
        })

        files.push(new File([signatureBlob], SIGNATURE_FILE_NAME))
      }

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
    [acceptedFiles, editor, router],
  )

  // submit on enter
  const onKeydown = useCallback(
    async (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        onSubmit(false)
      }
    },
    [onSubmit],
  )

  // add/remove keydown listener
  useEffect(() => {
    document.addEventListener('keydown', onKeydown)
    return () => document.removeEventListener('keydown', onKeydown)
  })

  const files = acceptedFiles.map((file, i) => (
    <li key={i}>
      {file.name} - {file.size} bytes — {file.lastModified} modified —{' '}
      {file.type} type
    </li>
  ))

  return (
    <section {...getRootProps()} className="Editor">
      <input {...getInputProps()} />
      {isDragActive && <div>Come to papa</div>}

      <div className="Floating">
        {state === 'editing' && (
          <button
            onClick={() => {
              setState('publishing')
            }}
            className="Button Floating"
          >
            Publish
          </button>
        )}
        {state === 'publishing' && (
          <div className="Floating">
            <button onClick={() => onSubmit(true)} className="Publish">
              Sign using Ethereum
            </button>
            <button onClick={() => onSubmit(false)} className="Publish">
              Publish Anonymously
            </button>
          </div>
        )}
        {state === 'redirecting' && <button>Copy Url</button>}
      </div>

      <EditorContent editor={editor} />
      <ul>{files}</ul>
    </section>
  )
}

const DisableModEnter = Extension.create({
  name: 'disable-mod-enter',
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => true,
    }
  },
})
