import { GetStaticPaths, GetStaticProps } from 'next'
import { useEffect, useState } from 'react'
import { Web3File, Web3Storage } from 'web3.storage'
import Status from '../components/Status'
import { METADATA_FILENAME, Pastepin } from '../components/Pin'
import Markdown from '../components/Markdown'

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_TOKEN as string,
})

interface Props extends Pastepin {
  pinCid: string
}

export default function PinPage({ pinCid, content }: Props) {
  const [attachments, setAttachments] = useState<Web3File[] | null>(null)

  useEffect(() => {
    const getAttachments = async () => {
      const res = await client.get(pinCid)
      if (!res) return
      const files = await res.files()
      setAttachments(files.filter((f) => f.name !== METADATA_FILENAME))
    }
    getAttachments()
  }, [pinCid])

  console.log('a', attachments)

  return (
    <main>
      <Status cid={pinCid} />
      <Markdown>{content}</Markdown>
    </main>
  )
}

// only fetching the content here, attachements are retrieved client side
export const getStaticProps: GetStaticProps = async ({ params }) => {
  try {
    if (!params || typeof params.cid !== 'string')
      throw new Error('CID not found.')

    const res = await client.get(params.cid)
    if (!res) throw new Error("Couldn't fetch content")

    const files = await res.files()
    console.log('Files:', files)

    const file = files.find((file) => file.name == METADATA_FILENAME)
    if (!file) throw new Error("Couldn't find the file")

    const raw = await file.text()
    const pin: Pastepin = JSON.parse(raw)

    return {
      props: {
        pinCid: params.cid,
        ...pin,
      },
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
