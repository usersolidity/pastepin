import { EditorContent, Extension, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useRouter } from 'next/dist/client/router'
import { useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import toast, { Toaster } from 'react-hot-toast'
import { Web3Storage } from 'web3.storage'
import { baseUrl } from '../utils'

export const CONTENT_FILE_NAME = 'content.html'

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_TOKEN as string,
})

const DEFAULT_CONTENT =
  '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h4>Heading 4</h4><h5>Heading 5</h5><h6>Heading 6<br></h6>'

interface Props {
  content?: string
  editable?: boolean
}

export const DisableModEnter = Extension.create({
  name: 'disable-mod-enter',
  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => true,
    }
  },
})

export default function Tiptap({
  content = DEFAULT_CONTENT,
  editable = true,
}: Props) {
  const router = useRouter()
  const editor = useEditor({
    extensions: [StarterKit.configure({ dropcursor: false }), DisableModEnter],
    content,
    editable,
    autofocus: 'end',
  })

  const { getRootProps, getInputProps, isDragActive, acceptedFiles } =
    useDropzone({
      noClick: true,
      noKeyboard: true,
    })

  const onSubmit = useCallback(async () => {
    if (!editor) return
    const html = editor.getHTML()
    const blob = new Blob([html], { type: 'text/html' })
    console.log('storing')
    const files = [...acceptedFiles, new File([blob], CONTENT_FILE_NAME)]
    const cid = await client.put(files)
    console.log('stored files with cid:', cid)

    const path = `/${cid}`
    await navigator.clipboard.writeText(baseUrl + path)
    toast.success('Copied Url')
    router.push(path)
  }, [acceptedFiles, editor, router])

  const onKeydown = useCallback(
    async (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'Enter') {
        e.preventDefault()
        e.stopPropagation()
        onSubmit()
      }
    },
    [onSubmit],
  )

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
    <section {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive && <div>Come to papa</div>}
      <Toaster />
      <button onClick={onSubmit}>Share</button>
      <EditorContent editor={editor} />
      <ul>{files}</ul>
    </section>
  )
}
