import { randomBytes } from 'crypto'
import { utils } from 'ethers'
import Redis from 'ioredis'
import { sign } from 'jsonwebtoken'
import type { NextApiRequest, NextApiResponse } from 'next'
import { getMessage } from '../../lib'

let redis = new Redis(process.env.REDIS_URL)

export default async function challenge(
  req: NextApiRequest,
  res: NextApiResponse<{}>,
) {
  switch (req.method) {
    // Returns a nonce to sign based the user's public address
    case 'GET': {
      const { publicAddress } = req.query
      if (typeof publicAddress !== 'string')
        return res.status(400).json({
          error: 'Invalid parameter: `publicAddress` should be a string',
        })

      const nonce = await getAuthenticationChallenge(publicAddress)
      return res.status(200).json({ nonce })
    }
    // Returns a JWT, given a username and password.
    case 'POST': {
      const { publicAddress, signature } = req.body
      if (typeof publicAddress !== 'string' || typeof signature !== 'string')
        return res.status(400).json({
          error:
            'Invalid parameter: `publicAddress` and `signature` should be a string',
        })

      const token = await authenticate(publicAddress, signature)
      return res.status(200).json({ token })
    }
    default: {
      return res
        .status(405)
        .json({ error: 'Invalid method: provide a GET or POST request' })
    }
  }
}

const recoverSignature = (nonce: string, signature: string) => {
  const message = getMessage(nonce)
  const address = utils.verifyMessage(message, signature)
  return address
}

export const authenticate = async (
  publicAddress: string,
  signature: string,
) => {
  const value = await redis.get(publicAddress)
  const nonce = value ? (JSON.parse(value) as User).nonce : null

  if (!nonce) throw new Error('User not found')

  // Update nonce so signature can't be replayed
  await getAuthenticationChallenge(publicAddress)

  const recoveredAddress = recoverSignature(nonce, signature)

  if (recoveredAddress.toLowerCase() === publicAddress.toLowerCase()) {
    const token = sign({ publicAddress }, process.env.JWT_SECRET as string, {
      expiresIn: '1h',
    })
    return token
  } else {
    throw new Error('bad signature')
  }
}

interface User {
  createdAt: string
  nonce: string
}

async function generateNonce() {
  const buffer = await randomBytes(16)
  return buffer.toString('hex')
}

export const getAuthenticationChallenge = async (publicAddress: string) => {
  let value = await redis.get(publicAddress)
  let user: User
  const nonce = await generateNonce()
  if (!value) {
    user = {
      createdAt: new Date().toISOString(),
      nonce,
    }
    await redis.set(publicAddress, JSON.stringify(user), 'EX', 1 * 60 * 60) // 1 hour
  } else {
    user = JSON.parse(value)
    user.nonce = nonce
    await redis.set(publicAddress, JSON.stringify(user), 'EX', 1 * 60 * 60) // 1 hour
  }

  return nonce
}
