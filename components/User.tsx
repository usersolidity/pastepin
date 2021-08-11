import { ExternalProvider, Web3Provider } from '@ethersproject/providers'
import React, { useState } from 'react'

interface Props {}

declare global {
  interface Window {
    ethereum: ExternalProvider
  }
}

export default function User({}: Props) {
  const [address, setAddress] = useState<string | null>(null)

  console.log({ address })

  return (
    <div
      style={{
        border: '1px solid #cccccc',
        padding: 16,
        width: 400,
        margin: 'auto',
        marginTop: 64,
      }}
    >
      {!address ? (
        <button
          type="button"
          onClick={async () => {
            const provider = new Web3Provider(window.ethereum)
            const signer = provider.getSigner()
            const message = 'yay'
            const signature = await signer.signMessage(message)
            setAddress(await signer.getAddress())
            console.log({ signature })
          }}
        >
          Connect
        </button>
      ) : (
        <div>Signed! {address}</div>
      )}
    </div>
  )
}
