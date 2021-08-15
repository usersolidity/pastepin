import { formatDistanceToNow } from 'date-fns'
import { verifyMessage } from 'ethers/lib/utils'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect, useState } from 'react'
import { Status as Web3Status, Web3Storage } from 'web3.storage'
import { Pastepin } from './Pin'

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_TOKEN as string,
})

const statusAtom = atom<Web3Status | undefined | null>(null)

interface Props extends Pastepin {
  cid: string
}

export default function Status({ cid, content, signature, address }: Props) {
  const [status, setStatus] = useAtom(statusAtom)
  const [details, setDetails] = useState(false)

  const getStatus = useCallback(async () => {
    const status = await client.status(cid)
    setStatus(status)
  }, [cid, setStatus])

  useEffect(() => {
    if (process.browser) getStatus()
  }, [getStatus])

  console.log('s', status)
  console.log({ details })

  return (
    <header className="center mt-24 -mb-20">
      {signature && address && (
        <div className="flex mb-3">
          {verifyMessage(content, signature) === address ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-blue-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          )}
          <span className="font-mono ml-1 text-sm text-gray-700 mt-px">
            {address}
          </span>
        </div>
      )}
      {status === null ? (
        '...'
      ) : status ? (
        <div className="flex items-baseline text-sm flex-wrap">
          <div
            className="bg-gray-50 rounded-md px-2 py-1 shadow-sm text-gray-700 whitespace-nowrap  mr-2 mb-2"
            title={status.created}
          >
            {formatDistanceToNow(new Date(status.created), {
              addSuffix: true,
            })}
          </div>
          {details && (
            <>
              <div className="bg-yellow-50 rounded-md px-2 py-1 shadow-sm text-yellow-700 whitespace-nowrap mr-2 mb-2">
                {status.dagSize} Bytes
              </div>
              <div className="bg-red-50 rounded-md px-2 py-1 shadow-sm text-red-700 whitespace-nowrap mr-2 mb-2">
                {status.pins.length} Pins
              </div>
              <div className="bg-green-50 rounded-md px-2 py-1 shadow-sm text-green-700 whitespace-nowrap mr-2 mb-2">
                {status.deals.length} Deals
              </div>
              <a
                className="bg-blue-50 rounded-md px-2 py-1 shadow-sm text-blue-700 whitespace-nowrap hover:underline mr-2 mb-2"
                href={`https://ipfs.io/ipfs/${status.cid}`}
                target="_blank"
                rel="noreferrer"
              >
                {status.cid}
              </a>
            </>
          )}
          <div
            onClick={() => setDetails(!details)}
            className="underline text-gray-500 cursor-pointer"
          >
            {details ? 'Less' : 'More'}
          </div>
        </div>
      ) : null}
    </header>
  )
}

const shortenAddress = (address: string, chars = 4) =>
  `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`
