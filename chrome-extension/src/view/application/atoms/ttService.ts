import { atom } from 'jotai'
import { TTServiceState, TTServiceStateWebData } from '../state/ttService'
import {
  initialState,
  reduceSetTTServicePartialWebData
} from '../helpers/ttService'

export const ttServiceAtom = atom<TTServiceState>(initialState)

export const setTTServicePartialWebDataAtom = atom(
  null,
  (get, set, change: Partial<TTServiceStateWebData>) => {
    const updated = reduceSetTTServicePartialWebData(get(ttServiceAtom), change)
    set(ttServiceAtom, updated)
  }
)
