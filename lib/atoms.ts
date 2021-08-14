import { atom } from 'jotai'

export const stateAtom = atom<'edit' | 'preview' | 'publish'>('edit')
export const titleAtom = atom('')
