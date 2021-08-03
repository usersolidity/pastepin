import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useCallback, useEffect } from 'react'
import { Web3Storage } from 'web3.storage'

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_TOKEN as string,
})

const DEFAULT_CONTENT =
  '<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3><h4>Heading 4</h4><h5>Heading 5</h5><h6>Heading 6<br></h6>'

interface Props {
  content?: string
  editable?: boolean
}

const Tiptap = (
  { content, editable }: Props = { content: DEFAULT_CONTENT, editable: true },
) => {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    editable,
  })

  const onSubmit = useCallback(
    async (e: KeyboardEvent) => {
      if (e.metaKey && e.key === 'Enter' && editor) {
        const html = editor.getHTML()
        const blob = new Blob([html], { type: 'text/html' })
        console.log('storing')
        const cid = await client.put([new File([blob], 'title.html')])
        console.log('stored files with cid:', cid)
      }
    },
    [editor],
  )

  useEffect(() => {
    document.addEventListener('keydown', onSubmit)
    return () => document.removeEventListener('keydown', onSubmit)
  })

  return <EditorContent editor={editor} />
}

export default Tiptap
