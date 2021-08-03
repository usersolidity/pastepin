import Tiptap from '../components/Tiptap'

export default function Home() {
  return (
    <div>
      <Tiptap />
      {/* <input
        className=""
        type="file"
        name="File Upload"
        onChange={(e) => {
          const files = e.target.files
          if (!files) return

          for (let i = 0; i < files.length; i++) {
            console.info(`Uploading file ${i + 1} out of ${files.length}...`)
            const file = files[i]
            fetch('/api/upload', {
              method: 'POST',
              body: file,
            })
          }
        }}
      /> */}
    </div>
  )
}
