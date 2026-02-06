import { atom } from 'jotai'
import { StackableState } from '../state/stackable'
import {
  initialState,
  setState,
  stackableTTValueChanged,
  stackableMarkupChanged
} from '../helpers/stackable'

export const stackableAtom = atom<StackableState>(initialState)

export const setStackableStateAtom = atom(
  null,
  (get, set, newState: any) => {
    const updated = setState(get(stackableAtom), newState)
    set(stackableAtom, updated)
  }
)

export const stackableTTValueChangedAtom = atom(
  null,
  (get, set, material: string, ttValue: string) => {
    const updated = stackableTTValueChanged(get(stackableAtom), material, ttValue)
    set(stackableAtom, updated)
  }
)

export const stackableMarkupChangedAtom = atom(
  null,
  (get, set, material: string, markup: string) => {
    const updated = stackableMarkupChanged(get(stackableAtom), material, markup)
    set(stackableAtom, updated)
  }
)
