import { GetStaticPaths, GetStaticProps } from 'next'
import { Web3Storage } from 'web3.storage'
import Tiptap from '../components/Tiptap'

interface Props {
  content: string
}

export default function Pin(props: Props) {
  return (
    <div>
      <Tiptap content={props.content} editable={false} />
    </div>
  )
}

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_TOKEN as string,
})

export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    if (!params || typeof params.cid !== 'string')
      throw new Error('CID not found.')

    const res = await client.get(params.cid)
    if (!res) throw new Error("Couldn't fetch content")

    const files = await res.files()
    console.log('Files:', files)

    const file = files.find((file) => file.name.includes('html'))
    const content = await file?.text()
    if (!content) throw new Error("Couldn't get the content")
    return {
      props: { content },
    }
  } catch (error) {
    console.log('Error in getStaticProps:', error)
    return { notFound: true }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const paths = []
  for await (const item of client.list()) {
    paths.push({ params: { cid: item.cid } })
  }

  console.log('getStaticPaths', paths)

  // We'll pre-render only these paths at build time.
  // { fallback: blocking } will server-render pages
  // on-demand if the path doesn't exist.
  return { paths, fallback: 'blocking' }
}
