export const baseUrl =
  typeof window !== 'undefined' && window.location.origin
    ? window.location.origin
    : ''

export const getMessage = (nonce: string) => `Nonce: ${nonce}`
