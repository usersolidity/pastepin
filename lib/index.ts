import type { ExternalProvider } from '@ethersproject/providers'

declare global {
  interface Window {
    ethereum: ExternalProvider
  }
}

export const baseUrl =
  typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : ''
