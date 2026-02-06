import { atom } from 'jotai'
import { blueprintsAtom, staredAtom, craftOptionsAtom, craftWebDataAtom, craftComputedAtom } from './craft'
import { inventoryStateAtom } from './inventory'
import { craftTabularData } from '../tabular/craft'
import { CRAFT_TABULAR_BLUEPRINTS } from '../state/craft'

/**
 * Craft Table Atoms
 * Derived atoms that extract specific data for craft tables
 */

// Computed craft state atom combining all craft atoms
const craftStateAtom = atom((get) => ({
  blueprints: get(blueprintsAtom),
  stared: get(staredAtom),
  options: get(craftOptionsAtom),
  web: get(craftWebDataAtom),
  c: get(craftComputedAtom)
}))

export const craftBlueprintsItemsAtom = atom((get) => {
  const craft = get(craftStateAtom)
  const inventory = get(inventoryStateAtom)
  const data = craftTabularData(craft, inventory)
  return data[CRAFT_TABULAR_BLUEPRINTS].items
})
