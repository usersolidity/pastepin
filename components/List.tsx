import { formatDistanceToNow } from 'date-fns'
import { useAtom, atom } from 'jotai'
import { useCallback, useEffect } from 'react'
import { Upload, Web3Storage } from 'web3.storage'

const client = new Web3Storage({
  token: process.env.NEXT_PUBLIC_WEB3_TOKEN as string,
})

const pinsAtom = atom<Upload[] | null>(null)

export default function List() {
  const [pins, setPins] = useAtom(pinsAtom)

  const getPins = useCallback(async () => {
    const uploads = []
    for await (const upload of client.list()) {
      console.log(upload)
      uploads.push(upload)
    }
    setPins(uploads)
  }, [setPins])

  useEffect(() => {
    if (process.browser) getPins()
  }, [getPins])

  console.log(pins)
  return (
    <section>
      <h1>All Pins</h1>
      {pins ? (
        pins.map((pin) => (
          <div key={pin.cid}>
            <h3>{pin.name}</h3>
            <p>
              {formatDistanceToNow(new Date(pin.created), {
                addSuffix: true,
              })}
            </p>
            <a
              href={`https://${pin.cid}.ipfs.dweb.link`}
              target="_blank"
              rel="noreferrer"
            >
              {pin.cid}
            </a>
          </div>
        ))
      ) : (
        <div>Loading...</div>
      )}
    </section>
  )
}
