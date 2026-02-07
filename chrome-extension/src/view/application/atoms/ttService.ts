import { atom } from 'jotai'
import { TTServiceState, TTServiceStateWebData, initialState } from '../state/ttService'

export const ttServiceAtom = atom<TTServiceState>(initialState)

export const setTTServicePartialWebDataAtom = atom(
  null,
  (get, set, change: Partial<TTServiceStateWebData>) => {
    const state = get(ttServiceAtom)
    set(ttServiceAtom, {
      ...state,
      web: {
        ...state.web,
        ...change
      }
    })
  }
)
