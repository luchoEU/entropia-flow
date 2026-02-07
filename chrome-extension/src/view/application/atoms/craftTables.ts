import { atom } from 'jotai'
import { blueprintsAtom, staredAtom, craftOptionsAtom, craftWebDataAtom, craftComputedAtom } from './craft'
import { rawInventoryItemsAtom } from './inventory'
import { getBlueprintList } from '../helpers/inventory'

/**
 * Blueprint item type for table display
 */
export interface BlueprintTabularItem {
  name: string
  stared: boolean
  quantity: number
}

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

/**
 * Blueprints items for the craft table
 * Groups blueprints by name with stared status and owned quantity
 */
export const craftBlueprintsItemsAtom = atom<BlueprintTabularItem[]>((get) => {
  const craft = get(craftStateAtom)
  const rawItems = get(rawInventoryItemsAtom)

  // Group blueprints by name with stared status and quantity
  const groupedMap = new Map<string, { name: string; stared: boolean; quantity: number }>()

  // Add all web blueprints if not in "owned only" mode
  if (!craft.options.owned) {
    for (const bpName of craft.web?.simpleBlueprintList ?? []) {
      const stared = craft.stared.list.includes(bpName)
      groupedMap.set(bpName, { name: bpName, stared, quantity: 0 })
    }
  }

  // Add owned blueprints from inventory
  const blueprintList = getBlueprintList(rawItems)
  for (const bp of blueprintList) {
    const name = bp.n
    const quantity = Number(bp.q)

    if (groupedMap.has(name)) {
      const existing = groupedMap.get(name)!
      existing.quantity += quantity
    } else {
      const stared = craft.stared.list.includes(name)
      groupedMap.set(name, { name, stared, quantity })
    }
  }

  let bps = Array.from(groupedMap.values())

  // Filter to custom blueprints if option enabled
  if (craft.options.custom) {
    bps = bps.filter(bp => craft.blueprints[bp.name]?.user)
  }

  return bps
})
