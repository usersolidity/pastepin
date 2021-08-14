/// <reference types="next" />
/// <reference types="next/types/global" />
/// <reference types="next/image-types/global" />

import type { ExternalProvider } from '@ethersproject/providers'

declare global {
  interface Window {
    ethereum: ExternalProvider
  }
}
