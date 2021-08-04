// import type { NextApiRequest, NextApiResponse } from 'next'
// import { Web3Storage,  } from 'web3.storage'

// type Data = {
//   status: 'success' | 'error'
//   message?: string
// }

// const storage = new Web3Storage({ token: process.env.WEB3_TOKEN as string })

// export default function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<Data>,
// ) {
//   try {
//     console.log(req)
//     // const files = await getFilesFromPath(path)
//     // console.log(`Uploading files from ${path}`)
//     // const cid = await storage.put(files)
//     // console.log('Content added with CID:', cid)

//     res.status(200).json({ status: 'success' })
//   } catch (error) {
//     res.status(500).json({ status: 'error', message: error })
//   }
// }
