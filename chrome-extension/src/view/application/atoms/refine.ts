import { atom } from 'jotai'
import { RefineState } from '../state/refine'
import {
  initialState,
  setState,
  refineAmountChanged
} from '../helpers/refine'

export const refineAtom = atom<RefineState>(initialState)

export const setRefineStateAtom = atom(
  null,
  (get, set, newState: RefineState) => {
    const updated = setState(get(refineAtom), newState)
    set(refineAtom, updated)
  }
)

export const refineAmountChangedAtom = atom(
  null,
  (get, set, material: string, amount: string) => {
    const updated = refineAmountChanged(get(refineAtom), material, amount)
    set(refineAtom, updated)
  }
)
