import { atom } from 'jotai'
import { SweatState } from '../state/sweat'
import {
  initialState,
  setState,
  sweatPriceChanged,
  sweatAmountChanged
} from '../helpers/sweat'

export const sweatAtom = atom<SweatState>(initialState)

export const setSweatStateAtom = atom(
  null,
  (get, set, newState: any) => {
    const updated = setState(get(sweatAtom), newState)
    set(sweatAtom, updated)
  }
)

export const sweatPriceChangedAtom = atom(
  null,
  (get, set, price: string) => {
    const updated = sweatPriceChanged(get(sweatAtom), price)
    set(sweatAtom, updated)
  }
)

export const sweatAmountChangedAtom = atom(
  null,
  (get, set, amount: string) => {
    const updated = sweatAmountChanged(get(sweatAtom), amount)
    set(sweatAtom, updated)
  }
)
