import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useCallback, useEffect } from 'react'
import { Web3Storage } from 'web3.storage'

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_TOKEN as string,
})

const Tiptap = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World! 🌎️</p>',
  })

  const submit = useCallback(
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
    document.addEventListener('keydown', submit)
    return () => document.removeEventListener('keydown', submit)
  })

  return <EditorContent editor={editor} />
}

export default Tiptap
