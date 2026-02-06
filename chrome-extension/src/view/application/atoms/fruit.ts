import { atom } from 'jotai'
import { FruitState } from '../state/fruit'
import {
  initialState,
  setState,
  fruitPriceChanged,
  fruitAmountChanged
} from '../helpers/fruit'

export const fruitAtom = atom<FruitState>(initialState)

export const setFruitStateAtom = atom(
  null,
  (get, set, newState: any) => {
    const updated = setState(get(fruitAtom), newState)
    set(fruitAtom, updated)
  }
)

export const fruitPriceChangedAtom = atom(
  null,
  (get, set, price: string) => {
    const updated = fruitPriceChanged(get(fruitAtom), price)
    set(fruitAtom, updated)
  }
)

export const fruitAmountChangedAtom = atom(
  null,
  (get, set, amount: string) => {
    const updated = fruitAmountChanged(get(fruitAtom), amount)
    set(fruitAtom, updated)
  }
)
