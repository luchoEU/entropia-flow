import { atom } from 'jotai'
import { ActivesState, ActivesItem } from '../state/actives'
import {
  initialState,
  startLoading,
  setLoadingStage,
  endLoading,
  setLoadingError,
  addActive,
  setActives,
  removeActive
} from '../helpers/actives'

export const activesAtom = atom<ActivesState>(initialState)

export const startActivesLoadingAtom = atom(
  null,
  (get, set, loadingText: string) => {
    const updated = startLoading(get(activesAtom), loadingText)
    set(activesAtom, updated)
  }
)

export const setActivesLoadingStageAtom = atom(
  null,
  (get, set, stage: number) => {
    const updated = setLoadingStage(get(activesAtom), stage)
    set(activesAtom, updated)
  }
)

export const endActivesLoadingAtom = atom(
  null,
  (get, set) => {
    const updated = endLoading(get(activesAtom))
    set(activesAtom, updated)
  }
)

export const setActivesLoadingErrorAtom = atom(
  null,
  (get, set, text: string) => {
    const updated = setLoadingError(get(activesAtom), text)
    set(activesAtom, updated)
  }
)

export const addActiveAtom = atom(
  null,
  (get, set, row: number, title: string, material: string, quantity: string, opening: string, openingFee: string, buyout: string, buyoutFee: string) => {
    const updated = addActive(get(activesAtom), row, title, material, quantity, opening, openingFee, buyout, buyoutFee)
    set(activesAtom, updated)
  }
)

export const setActivesAtom = atom(
  null,
  (get, set, list: ActivesItem[]) => {
    const updated = setActives(get(activesAtom), list)
    set(activesAtom, updated)
  }
)

export const removeActiveAtom = atom(
  null,
  (get, set, date: number) => {
    const updated = removeActive(get(activesAtom), date)
    set(activesAtom, updated)
  }
)
