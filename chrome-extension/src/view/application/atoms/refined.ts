import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import { LOCAL_STORAGE } from '../../../chrome/chromeStorageArea'
import { STORAGE_VIEW_REFINED } from '../../../common/const'
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

let cachedRefinedData: RefinedState = JSON.parse(JSON.stringify(initialState))

export const refinedMapAtom = atomWithStorage<RefinedState>(
  STORAGE_VIEW_REFINED,
  JSON.parse(JSON.stringify(initialState)),
  {
    getItem: (_key: string): RefinedState => cachedRefinedData,
    setItem: async (_key: string, value: RefinedState): Promise<void> => {
      try {
        cachedRefinedData = value
        await LOCAL_STORAGE.set(STORAGE_VIEW_REFINED, value)
      } catch (error) {
        console.error('Failed to save refined state to storage:', error)
      }
    },
    removeItem: (_key: string): void => {
      // Not used
    }
  }
)

export const setRefinedStateAtom = atom(
  null,
  (get, set, newState: RefinedState) => {
    const updated = setState(get(refinedMapAtom), newState)
    set(refinedMapAtom, updated)
  }
)

export const setRefinedValueAtom = atom(
  null,
  (get, set, material: string, value: string) => {
    const itemsMap = get(itemsMapAtom)
    const updated = refinedValueChanged(get(refinedMapAtom), material, value, itemsMap)
    set(refinedMapAtom, updated)
  }
)

export const setRefinedMarkupAtom = atom(
  null,
  (get, set, material: string, markup: string) => {
    const itemsMap = get(itemsMapAtom)
    const updated = refinedMarkupChanged(get(refinedMapAtom), material, markup, itemsMap)
    set(refinedMapAtom, updated)
  }
)

export const recalculateRefinedMaterialAtom = atom(
  null,
  (get, set) => {
    const itemsMap = get(itemsMapAtom)
    const updated = refinedMaterialChanged(get(refinedMapAtom), itemsMap)
    set(refinedMapAtom, updated)
  }
)

// Atom factory for getting a single refined material by name
const getRefinedCache = new Map<string, any>()

export async function initializeRefinedFromStorage(): Promise<void> {
  try {
    const storedState = await LOCAL_STORAGE.get(STORAGE_VIEW_REFINED)
    if (storedState && storedState.map) {
      const merged = {
        ...initialState,
        map: {
          ...initialState.map
        }
      }
      for (const key of Object.keys(initialState.map)) {
        const storedItem = storedState.map[key]
        if (storedItem) {
          merged.map[key] = {
            ...initialState.map[key],
            calculator: {
              ...initialState.map[key].calculator,
              in: {
                ...initialState.map[key].calculator.in,
                ...(storedItem.calculator?.in || {})
              }
            }
          }
        }
      }
      cachedRefinedData = JSON.parse(JSON.stringify(merged))
    }
  } catch (error) {
    console.error('Failed to initialize refined state from storage:', error)
  }
}

export const initializeRefinedAtom = atom(
  null,
  async (get, set) => {
    await initializeRefinedFromStorage()
    set(refinedMapAtom, cachedRefinedData)
    set(recalculateRefinedMaterialAtom)
  }
)

export const getRefinedAtom = (material: string) => {
  if (!getRefinedCache.has(material)) {
    getRefinedCache.set(material, atom((get) => {
      const refined = get(refinedMapAtom)
      return refined.map[material]
    }))
  }
  return getRefinedCache.get(material)
}
