import { formatDistanceToNow } from 'date-fns'
import { atom, useAtom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { Status as Web3Status, Web3Storage } from 'web3.storage'

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_TOKEN as string,
})

const statusAtom = atom<Web3Status | undefined | null>(null)

interface Props {
  cid: string
}

export default function Status({ cid }: Props) {
  const [status, setStatus] = useAtom(statusAtom)

  const getStatus = useCallback(async () => {
    const status = await client.status(cid)
    setStatus(status)
  }, [cid, setStatus])

  useEffect(() => {
    if (process.browser) getStatus()
  }, [getStatus])

  console.log('s', status)

  return (
    <section>
      <h1>Status</h1>
      {status === null ? (
        'Loading...'
      ) : status ? (
        <div>
          <p>
            {formatDistanceToNow(new Date(status.created), {
              addSuffix: true,
            })}
          </p>
          <a
            href={`https://${status.cid}.ipfs.dweb.link`}
            target="_blank"
            rel="noreferrer"
          >
            {status.cid}
          </a>
          <p>Size: {status.dagSize}</p>
          <p>Pins: {status.pins.length}</p>
          <p>Deals: {status.deals.length}</p>
        </div>
      ) : null}
    </section>
  )
}
