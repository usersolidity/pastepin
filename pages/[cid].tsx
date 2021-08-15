import { saveAs } from 'file-saver'
import { GetStaticPaths, GetStaticProps } from 'next'
import React, { useEffect, useState } from 'react'
import { Web3File, Web3Storage } from 'web3.storage'
import Markdown from '../components/Markdown'
import Nav from '../components/Nav'
import { METADATA_FILENAME, Pastepin } from '../components/Pin'
import Status from '../components/Status'

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_TOKEN as string,
})

interface Props extends Pastepin {
  cid: string // pin cid (not pastepin.json's)
}

export default function PinPage(props: Props) {
  const { cid, title, content } = props
  const [files, setFiles] = useState<Web3File[] | null>(null)

  useEffect(() => {
    const getFiles = async () => {
      const res = await client.get(cid)
      if (!res) return
      const files = await res.files()
      setFiles(files.filter((f) => f.name !== METADATA_FILENAME))
    }
    getFiles()
  }, [cid])

  console.log({ files })

  return (
    <>
      <Nav title={title} />
      <Status {...props} />
      <Markdown>{content}</Markdown>
      <div className="fixed z-10 left-1/2 -translate-x-1/2 bottom-20 flex justify-center flex-wrap">
        <ul className="w-full h-full flex flex-wrap justify-center mb-3">
          {files &&
            files.map((file, i) => (
              <li
                key={i}
                style={{ maxWidth: '169px' }}
                className="group relative bg-gray-50 rounded-md px-2 py-1 h-full m-1 shadow-sm cursor-pointer"
                onClick={() => {
                  saveAs(file)
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
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z"
                    clipRule="evenodd"
                  />
                </svg>
              </li>
            ))}
        </ul>
      </div>
    </>
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
        cid: params.cid,
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
