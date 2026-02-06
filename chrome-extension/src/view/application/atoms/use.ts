import { atom } from 'jotai'
import { UseState } from '../state/use'
import {
  initialState,
  setState,
  useAmountChanged
} from '../helpers/use'

export const useAtom = atom<UseState>(initialState)

export const setUseStateAtom = atom(
  null,
  (get, set, newState: UseState) => {
    const updated = setState(get(useAtom), newState)
    set(useAtom, updated)
  }
)

export const useAmountChangedAtom = atom(
  null,
  (get, set, material: string, amount: string) => {
    const updated = useAmountChanged(get(useAtom), material, amount)
    set(useAtom, updated)
  }
)
