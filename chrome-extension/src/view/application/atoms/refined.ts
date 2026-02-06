import { atom } from 'jotai'
import { RefinedState, RefinedOneState } from '../state/refined'
import { ItemsMap } from '../state/items'
import {
  initialState,
  setState,
  refinedValueChanged,
  refinedMarkupChanged,
  refinedMaterialChanged
} from '../helpers/refined'
import { itemsMapAtom } from './items'

export const refinedMapAtom = atom<RefinedState>(initialState)

export const setRefinedStateAtom = atom(
  null,
  (get, set, newState: RefinedState) => {
    const updated = setState(get(refinedMapAtom), newState)
    set(refinedMapAtom, updated)
  }
)

export const refinedValueChangedAtom = atom(
  null,
  (get, set, material: string, value: string) => {
    const itemsMap = get(itemsMapAtom)
    const updated = refinedValueChanged(get(refinedMapAtom), material, value, itemsMap)
    set(refinedMapAtom, updated)
  }
)

export const refinedMarkupChangedAtom = atom(
  null,
  (get, set, material: string, markup: string) => {
    const itemsMap = get(itemsMapAtom)
    const updated = refinedMarkupChanged(get(refinedMapAtom), material, markup, itemsMap)
    set(refinedMapAtom, updated)
  }
)

export const refinedMaterialChangedAtom = atom(
  null,
  (get, set) => {
    const itemsMap = get(itemsMapAtom)
    const updated = refinedMaterialChanged(get(refinedMapAtom), itemsMap)
    set(refinedMapAtom, updated)
  }
)

// Atom factory for getting a single refined material by name
const getRefinedCache = new Map<string, any>()

export const getRefinedAtom = (material: string) => {
  if (!getRefinedCache.has(material)) {
    getRefinedCache.set(material, atom((get) => {
      const refined = get(refinedMapAtom)
      return refined.map[material]
    }))
  }
  return getRefinedCache.get(material)
}
