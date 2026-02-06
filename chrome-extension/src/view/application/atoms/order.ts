import { atom } from 'jotai'
import { OrderState } from '../state/order'
import {
  initialState,
  setState,
  markupChanged,
  valueChanged
} from '../helpers/order'

export const orderAtom = atom<OrderState>(initialState)

export const setOrderStateAtom = atom(
  null,
  (get, set, newState: OrderState) => {
    const updated = setState(get(orderAtom), newState)
    set(orderAtom, updated)
  }
)

export const orderMarkupChangedAtom = atom(
  null,
  (get, set, markup: string) => {
    const updated = markupChanged(get(orderAtom), markup)
    set(orderAtom, updated)
  }
)

export const orderValueChangedAtom = atom(
  null,
  (get, set, value: string) => {
    const updated = valueChanged(get(orderAtom), value)
    set(orderAtom, updated)
  }
)
