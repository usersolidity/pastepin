import { atom } from 'jotai'

export const stateAtom = atom<'edit' | 'preview' | 'redirect'>('edit')
export const titleAtom = atom('')
