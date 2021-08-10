import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers'
import { useWeb3React } from '@web3-react/core'
import { InjectedConnector } from '@web3-react/injected-connector'
import React, { useState } from 'react'
import { getMessage } from '../lib'

const injectedConnector = new InjectedConnector({
  supportedChainIds: [
    1, // Mainet
    3, // Ropsten
    4, // Rinkeby
    5, // Goerli
    42, // Kovan
  ],
})

interface Props {}

export default function User({}: Props) {
  const { chainId, account, activate, active, library } =
    useWeb3React<Web3Provider>()
  const [token, setToken] = useState<string | null>(null)
  const [authResponse, setAuthResponse] = useState<string | null>(null)

  console.log({ token })
  console.log({ authResponse })

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
      <div>
        <div>ChainId: {chainId}</div>
        <div>Account: {account}</div>
        {!active ? (
          // connect wallet
          <button
            type="button"
            onClick={() => {
              activate(injectedConnector)
            }}
          >
            Connect
          </button>
        ) : (
          // connected, show user actions
          <div style={{ margin: 8 }}>
            {!token ? (
              // login
              <button
                style={{ marginTop: 8 }}
                onClick={async () => {
                  const signer = library?.getSigner()
                  if (!signer) throw new Error('Signer is undefined')
                  const result = await login(signer)
                  setToken(result)
                }}
              >
                Login!
              </button>
            ) : (
              <div>
                <div>token: {token}</div>

                <button
                  style={{ marginTop: 8 }}
                  onClick={() => {
                    setToken(null)
                    setAuthResponse(null)
                  }}
                >
                  Logout!
                </button>
                <div style={{ padding: 16, paddingBottom: 150 }}>
                  token: {token}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

async function login(signer: JsonRpcSigner) {
  // get nonce
  const address = await signer.getAddress()
  const result = await fetch(`/api/challenge?publicAddress=${address}`)
  const { nonce } = await result.json()
  console.log({ nonce })

  // sign nonce
  const message = getMessage(nonce)
  const signature = await signer.signMessage(message)
  console.log({ signature })

  // send signature
  const loginResult = await fetch('/api/challenge', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      publicAddress: address,
      signature,
    }),
  })

  const { token } = await loginResult.json()
  console.log({ token })
  return token
}
