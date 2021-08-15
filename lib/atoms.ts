import { atom } from 'jotai'

export const stateAtom = atom<'edit' | 'preview' | 'upload' | 'redirect'>(
  'edit',
)
export const titleAtom = atom('')
