import { atom } from 'jotai'
import { atomWithStorage } from 'jotai/utils'
import {
  BlueprintData,
  BlueprintAutoCalc,
  CraftState,
  CraftOptions,
  CraftingWebData,
  BlueprintStateWebData,
  STEP_INACTIVE,
  STEP_REFRESH_TO_START,
  STEP_REFRESH_ERROR,
  STEP_READY,
  STEP_REFRESH_TO_END,
  STEP_SAVING,
  STEP_DONE,
} from '../state/craft'
import { STAGE_INITIALIZING } from '../../services/api/sheets/sheetsStages'
import * as Sort from '../helpers/craftSort'
import { multiIncludes } from '../../../common/filter'
import { IWebSource } from '../../../web/sources'
import { renameNewBlueprintName } from '../../../web/rename'
import { rawInventoryItemsAtom } from './inventory'
import { itemsMapAtom } from './items'

/**
 * Base atom for all blueprints
 * Persisted to storage for state persistence across sessions
 */
export const blueprintsAtom = atomWithStorage<{ [name: string]: BlueprintData }>(
  'craft-blueprints',
  {}
)

/**
 * Stared blueprints state (favorites) - persisted
 * Controls which blueprints are marked as favorites and how they're filtered/sorted
 */
export const staredAtom = atomWithStorage<{
  expanded: boolean
  sortType: number
  filter?: string
  list: Array<string>
}>(
  'craft-stared',
  {
    expanded: true,
    sortType: Sort.SORT_NAME_ASCENDING,
    filter: undefined,
    list: []
  }
)

/**
 * Craft options state - persisted
 * Controls visibility of custom and owned blueprints
 */
export const craftOptionsAtom = atomWithStorage<CraftOptions>(
  'craft-options',
  {
    custom: false,
    owned: false
  }
)

/**
 * Active crafting session name - persisted
 */
export const activeSessionAtom = atomWithStorage<string | undefined>(
  'craft-activeSession',
  undefined
)

/**
 * Active planet for blueprint filtering - persisted
 */
export const activePlanetAtom = atomWithStorage<string | undefined>(
  'craft-activePlanet',
  undefined
)

/**
 * Edit mode blueprint name - persisted
 */
export const editModeBlueprintNameAtom = atomWithStorage<string | undefined>(
  'craft-editModeBlueprintName',
  undefined
)

/**
 * Web data for crafting (blueprint lists from web) - persisted
 */
export const craftWebDataAtom = atomWithStorage<CraftingWebData | undefined>(
  'craft-webData',
  undefined
)

/**
 * Atom factory to get a single blueprint by name
 */
export const getBlueprintAtom = (name: string) =>
  atom((get) => {
    const blueprints = get(blueprintsAtom)
    return blueprints[name]
  })

/**
 * Helper function to convert blueprint name to item name
 */
const itemNameFromBpName = (bpName: string): string => bpName?.split('Blueprint')[0].trim()

/**
 * Apply filter and sort to stared blueprints
 */
const _applyFilter = (
  blueprints: { [name: string]: BlueprintData },
  stared: { expanded: boolean; sortType: number; filter?: string; list: Array<string> }
) => {
  const filtered = stared.filter
    ? stared.list.filter((name) => multiIncludes(stared.filter!, name))
    : stared.list

  const blueprintData = filtered.map((name) => blueprints[name]).filter((bp) => bp)

  return Sort.sortList(stared.sortType, blueprintData)
}

/**
 * Computed atom: Get filtered and sorted stared blueprints
 */
export const filteredStaredBlueprintsAtom = atom((get) => {
  const blueprints = get(blueprintsAtom)
  const stared = get(staredAtom)
  return _applyFilter(blueprints, stared)
})

/**
 * Computed atom: Get all computed state
 */
export const craftComputedAtom = atom((get) => ({
  filteredStaredBlueprints: get(filteredStaredBlueprintsAtom),
  residues: {} as { [name: string]: number } // TODO: Calculate from inventory
}))

/**
 * Computed atom: Auto-calculate blueprint data
 * Derives computed fields from blueprint state including inventory synchronization
 */
export const blueprintAutoCalcAtom = atom((get) => {
  const blueprints = get(blueprintsAtom)
  const options = get(craftOptionsAtom)

  // Get inventory data for calculation
  const rawInventoryItems = get(rawInventoryItemsAtom)
  const itemsMapData = get(itemsMapAtom)

  // Build a map of item name -> available quantity from inventory
  const inventoryQuantities: { [itemName: string]: number } = {}
  if (Array.isArray(rawInventoryItems)) {
    rawInventoryItems.forEach((item: any) => {
      inventoryQuantities[item.name] = (inventoryQuantities[item.name] || 0) + item.quantity
    })
  }

  const result: { [name: string]: BlueprintAutoCalc } = {}

  for (const [name, bp] of Object.entries(blueprints)) {
    const itemName = itemNameFromBpName(name)

    // Calculate clicks based on available materials
    let clicks: any = undefined
    if (bp.budget?.sheet && bp.user?.materials && bp.user.materials.length > 0) {
      // Calculate how many clicks are possible with available materials
      let availableClicks = Infinity
      const limitingItems: string[] = []

      bp.user.materials.forEach((m) => {
        const available = inventoryQuantities[m.name] || 0
        const neededPerClick = parseInt(m.quantity) || 0
        const possibleClicks = neededPerClick > 0 ? Math.floor(available / neededPerClick) : 0

        if (possibleClicks < availableClicks) {
          availableClicks = possibleClicks
          limitingItems.length = 0
          limitingItems.push(m.name)
        } else if (possibleClicks === availableClicks && possibleClicks >= 0) {
          if (!limitingItems.includes(m.name)) {
            limitingItems.push(m.name)
          }
        }
      })

      clicks = {
        bp: 0,
        available: availableClicks === Infinity ? 0 : availableClicks,
        limitingItems: availableClicks === Infinity ? [] : limitingItems,
        ttCost: bp.budget.sheet.clickMUCost ?? 0,
        residueNeeded: 0
      }
    }

    result[name] = {
      itemName,
      owned: options.owned,
      clicks,
      materials: bp.user?.materials?.map((m) => {
        const itemData = itemsMapData[m.name]
        const itemWebData = itemData?.web?.item?.data?.value
        return {
          name: m.name,
          type: itemWebData?.type || '',
          quantity: parseInt(m.quantity) || 0,
          value: itemWebData?.value || 0,
          available: inventoryQuantities[m.name] || 0,
          clicks: 0
        }
      }) ?? [],
      suggestedMaterials: undefined
    }
  }

  return result
})

/**
 * Write atom: Add a new blueprint
 */
export const addBlueprintAtom = atom(
  null,
  (get, set, name: string) => {
    const blueprints = get(blueprintsAtom)
    if (!blueprints[name]) {
      set(blueprintsAtom, {
        ...blueprints,
        [name]: {
          name,
          budget: {
            loading: true,
            stage: STAGE_INITIALIZING,
            hasPage: false
          },
          session: {
            step: STEP_INACTIVE
          }
        }
      })
    }
  }
)

/**
 * Write atom: Remove a blueprint
 */
export const removeBlueprintAtom = atom(
  null,
  (get, set, name: string) => {
    const blueprints = get(blueprintsAtom)
    const stared = get(staredAtom)

    const newBlueprints = { ...blueprints }
    delete newBlueprints[name]

    set(blueprintsAtom, newBlueprints)

    // Remove from stared list if present
    if (stared.list.includes(name)) {
      set(staredAtom, {
        ...stared,
        list: stared.list.filter((n) => n !== name)
      })
    }
  }
)

/**
 * Write atom: Toggle blueprint favorite status
 */
export const setBlueprintStaredAtom = atom(
  null,
  (get, set, name: string, stared: boolean) => {
    const staredState = get(staredAtom)
    const list = staredState.list

    const newList = stared ? (list.includes(name) ? list : [...list, name]) : list.filter((n) => n !== name)

    set(staredAtom, {
      ...staredState,
      list: newList
    })
  }
)

/**
 * Write atom: Sort blueprints
 */
export const sortBlueprintsByAtom = atom(
  null,
  (get, set, part: number) => {
    const stared = get(staredAtom)
    const sortType = Sort.nextSortType(part, stared.sortType)

    set(staredAtom, {
      ...stared,
      sortType
    })
  }
)

/**
 * Write atom: Filter stared blueprints
 */
export const setStaredBlueprintsFilterAtom = atom(
  null,
  (get, set, filter: string) => {
    const stared = get(staredAtom)
    set(staredAtom, {
      ...stared,
      filter
    })
  }
)

/**
 * Write atom: Set active planet
 */
export const setCraftActivePlanetAtom = atom(
  null,
  (get, set, planet: string | undefined) => {
    set(activePlanetAtom, planet)
  }
)

/**
 * Write atom: Set craft options
 */
export const setCraftOptionsAtom = atom(
  null,
  (get, set, options: Partial<CraftOptions>) => {
    const current = get(craftOptionsAtom)
    set(craftOptionsAtom, { ...current, ...options })
  }
)

/**
 * Write atom: Set edit mode blueprint
 */
export const setEditModeBlueprintAtom = atom(
  null,
  (get, set, name: string | undefined) => {
    set(editModeBlueprintNameAtom, name)
  }
)

/**
 * Write atom: Update blueprint partial data
 */
export const setBlueprintPartialWebDataAtom = atom(
  null,
  (get, set, name: string, change: Partial<BlueprintStateWebData>) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[name]

    if (bp) {
      set(blueprintsAtom, {
        ...blueprints,
        [name]: {
          ...bp,
          web: { ...bp.web, ...change } as BlueprintStateWebData
        }
      })
    }
  }
)

/**
 * Write atom: Set blueprint active session
 */
export const setActiveSessionAtom = atom(
  null,
  (get, set, bpName: string | undefined) => {
    set(activeSessionAtom, bpName)
  }
)

/**
 * Write atom: Start crafting session
 */
export const startCraftingSessionAtom = atom(
  null,
  (get, set, bpName: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          session: {
            step: STEP_REFRESH_TO_START
          }
        }
      })

      set(activeSessionAtom, bpName)
    }
  }
)

/**
 * Write atom: End crafting session
 */
export const endCraftingSessionAtom = atom(
  null,
  (get, set, bpName: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          session: {
            step: STEP_REFRESH_TO_END
          }
        }
      })
    }
  }
)

/**
 * Write atom: Clear crafting session
 */
export const clearCraftingSessionAtom = atom(
  null,
  (get, set, bpName: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          session: {
            step: STEP_INACTIVE
          }
        }
      })

      set(activeSessionAtom, undefined)
    }
  }
)

/**
 * Write atom: Mark crafting session as ready
 */
export const readyCraftingSessionAtom = atom(
  null,
  (get, set, bpName: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.session) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          session: {
            ...bp.session,
            step: STEP_READY
          }
        }
      })
    }
  }
)

/**
 * Write atom: Handle crafting session error
 */
export const errorCraftingSessionAtom = atom(
  null,
  (get, set, bpName: string, errorText: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.session) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          session: {
            ...bp.session,
            step: STEP_REFRESH_ERROR,
            errorText
          }
        }
      })
    }
  }
)

/**
 * Write atom: Set crafting session material diff
 */
export const setNewCraftingSessionDiffAtom = atom(
  null,
  (get, set, bpName: string, diffMaterials: any[]) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.session) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          session: {
            ...bp.session,
            diffMaterials
          }
        }
      })
    }
  }
)

/**
 * Write atom: Set crafting session saving stage
 */
export const setCraftingSessionStageAtom = atom(
  null,
  (get, set, bpName: string, stage: number) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.session) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          session: {
            ...bp.session,
            stage
          }
        }
      })
    }
  }
)

/**
 * Write atom: Mark crafting session as done
 */
export const doneCraftingSessionAtom = atom(
  null,
  (get, set, bpName: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.session) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          session: {
            ...bp.session,
            step: STEP_DONE
          }
        }
      })
    }
  }
)

/**
 * Write atom: Start budget page loading
 */
export const startBudgetPageLoadingAtom = atom(
  null,
  (get, set, bpName: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          budget: {
            loading: true,
            stage: STAGE_INITIALIZING,
            hasPage: false
          }
        }
      })
    }
  }
)

/**
 * Write atom: Set budget page loading stage
 */
export const setBudgetPageStageAtom = atom(
  null,
  (get, set, bpName: string, stage: number) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.budget) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          budget: {
            ...bp.budget,
            stage
          }
        }
      })
    }
  }
)

/**
 * Write atom: End budget page loading
 */
export const endBudgetPageLoadingAtom = atom(
  null,
  (get, set, bpName: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.budget) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          budget: {
            ...bp.budget,
            loading: false
          }
        }
      })
    }
  }
)

/**
 * Write atom: Set budget page info
 */
export const setBudgetPageInfoAtom = atom(
  null,
  (get, set, bpName: string, info: any) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.budget) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          budget: {
            ...bp.budget,
            hasPage: true,
            sheet: info
          }
        }
      })
    }
  }
)

/**
 * Write atom: Handle budget page loading error
 */
export const errorBudgetPageLoadingAtom = atom(
  null,
  (get, set, bpName: string, errorText: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.budget) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          budget: {
            ...bp.budget,
            loading: false,
            errorText
          }
        }
      })
    }
  }
)

/**
 * Write atom: Record material purchase in budget
 */
export const buyBudgetPageMaterialAtom = atom(
  null,
  (get, set, bpName: string, materialName: string, buyCost: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.budget?.sheet?.materials) {
      const materials = { ...bp.budget.sheet.materials }
      const material = materials[materialName]

      if (material) {
        materials[materialName] = {
          ...material,
          buyCost
        }

        set(blueprintsAtom, {
          ...blueprints,
          [bpName]: {
            ...bp,
            budget: {
              ...bp.budget,
              sheet: {
                ...bp.budget.sheet,
                materials
              }
            }
          }
        })
      }
    }
  }
)

/**
 * Write atom: Mark material purchase as done
 */
export const doneBuyBudgetAtom = atom(
  null,
  (get, set, bpName: string, materialName: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.budget?.sheet?.materials) {
      const materials = { ...bp.budget.sheet.materials }
      const material = materials[materialName]

      if (material) {
        materials[materialName] = {
          ...material,
          buyDone: true
        }

        set(blueprintsAtom, {
          ...blueprints,
          [bpName]: {
            ...bp,
            budget: {
              ...bp.budget,
              sheet: {
                ...bp.budget.sheet,
                materials
              }
            }
          }
        })
      }
    }
  }
)

/**
 * Write atom: Clear material purchase state
 */
export const clearBuyBudgetAtom = atom(
  null,
  (get, set, bpName: string, materialName: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.budget?.sheet?.materials) {
      const materials = { ...bp.budget.sheet.materials }
      const material = materials[materialName]

      if (material) {
        materials[materialName] = {
          ...material,
          buyCost: undefined,
          buyDone: false
        }

        set(blueprintsAtom, {
          ...blueprints,
          [bpName]: {
            ...bp,
            budget: {
              ...bp.budget,
              sheet: {
                ...bp.budget.sheet,
                materials
              }
            }
          }
        })
      }
    }
  }
)

/**
 * Write atom: Update material buy cost
 */
export const changeBudgetPageBuyCostAtom = atom(
  null,
  (get, set, bpName: string, materialName: string, cost: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.budget?.sheet?.materials) {
      const materials = { ...bp.budget.sheet.materials }
      const material = materials[materialName]

      if (material) {
        materials[materialName] = {
          ...material,
          buyCost: cost
        }

        set(blueprintsAtom, {
          ...blueprints,
          [bpName]: {
            ...bp,
            budget: {
              ...bp.budget,
              sheet: {
                ...bp.budget.sheet,
                materials
              }
            }
          }
        })
      }
    }
  }
)

/**
 * Write atom: Update material buy fee
 */
export const changeBudgetPageBuyFeeAtom = atom(
  null,
  (get, set, bpName: string, materialName: string, withFee: boolean) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.budget?.sheet?.materials) {
      const materials = { ...bp.budget.sheet.materials }
      const material = materials[materialName]

      if (material) {
        materials[materialName] = {
          ...material,
          withFee
        }

        set(blueprintsAtom, {
          ...blueprints,
          [bpName]: {
            ...bp,
            budget: {
              ...bp.budget,
              sheet: {
                ...bp.budget.sheet,
                materials
              }
            }
          }
        })
      }
    }
  }
)

/**
 * Full CraftState for backward compatibility
 * Used for synchronization from Redux during migration
 */
export const fullCraftStateAtom = atom((get) => {
  const blueprints = get(blueprintsAtom)
  const stared = get(staredAtom)
  const options = get(craftOptionsAtom)
  const activeSession = get(activeSessionAtom)
  const activePlanet = get(activePlanetAtom)
  const editModeBlueprintName = get(editModeBlueprintNameAtom)
  const web = get(craftWebDataAtom)
  const computed = get(craftComputedAtom)

  return {
    blueprints,
    stared,
    options,
    activeSession,
    activePlanet,
    editModeBlueprintName,
    web,
    c: computed
  } as CraftState
})

/**
 * Write atom: Reload blueprint (clear web data and schedule reload)
 */
export const reloadBlueprintAtom = atom(
  null,
  (get, set, name: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[name]

    if (bp) {
      set(blueprintsAtom, {
        ...blueprints,
        [name]: {
          ...bp,
          web: undefined
        }
      })
    }
  }
)

/**
 * Write atom: Set blueprint list from web
 */
export const setBlueprintListAtom = atom(
  null,
  (get, set, list: string[]) => {
    const web = get(craftWebDataAtom)
    set(craftWebDataAtom, {
      ...web,
      simpleBlueprintList: list
    } as CraftingWebData)
  }
)

/**
 * Write atom: Set blueprint material type and value
 * Updates user materials with type and value metadata
 */
export const setBlueprintMaterialTypeAndValueAtom = atom(
  null,
  (get, set, bpName: string, materialName: string, type: string, value: number) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.user?.materials) {
      const materials = bp.user.materials.map((m) =>
        m.name === materialName ? { ...m, quantity: m.quantity } : m
      )

      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          user: {
            ...bp.user,
            materials
          }
        }
      })
    }
  }
)

/**
 * UI State atom: Store suggested materials (not persisted in blueprint data)
 */
export const suggestionMaterialsUIAtom = atom<{
  [bpName: string]: { index: number; list: string[] }
}>({})

/**
 * Write atom: Set suggested materials for blueprint (UI state)
 */
export const setBlueprintSuggestedMaterialsAtom = atom(
  null,
  (get, set, bpName: string, index: number, list: string[]) => {
    const current = get(suggestionMaterialsUIAtom)
    set(suggestionMaterialsUIAtom, {
      ...current,
      [bpName]: { index, list }
    })
  }
)

/**
 * Write atom: Show blueprint material data
 * This is a state update for UI purposes (triggers side effects in middleware)
 */
export const showBlueprintMaterialDataAtom = atom(
  null,
  (get, set, bpName: string, materialName: string) => {
    // This action triggers side effects in middleware (loading material data)
    // No state change needed in Jotai - handled by middleware
  }
)

/**
 * Write atom: Set blueprint quantity (available materials)
 * This is a computed/UI state derived from inventory
 * Not stored in blueprint data - calculated by blueprintAutoCalcAtom
 */
export const setBlueprintQuantityAtom = atom(
  null,
  (get, set, itemQuantities: { [itemName: string]: number }) => {
    // Quantity information is now calculated in blueprintAutoCalcAtom
    // based on blueprint data and is not persisted
  }
)

/**
 * Write atom: Add material to blueprint (edit mode)
 */
export const addBlueprintMaterialAtom = atom(
  null,
  (get, set, bpName: string, material: { name: string; quantity: string }) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp) {
      const user = bp.user || { materials: [] }
      const newMaterials = [...user.materials, material]

      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          user: {
            ...user,
            materials: newMaterials
          }
        }
      })
    }
  }
)

/**
 * Write atom: Remove material from blueprint (edit mode)
 */
export const removeBlueprintMaterialAtom = atom(
  null,
  (get, set, bpName: string, index: number) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.user?.materials) {
      const materials = bp.user.materials.filter((_, i) => i !== index)

      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          user: {
            ...bp.user,
            materials
          }
        }
      })
    }
  }
)

/**
 * Write atom: Move material in blueprint (reorder, edit mode)
 */
export const moveBlueprintMaterialAtom = atom(
  null,
  (get, set, bpName: string, fromIndex: number, toIndex: number) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.user?.materials) {
      const materials = [...bp.user.materials]
      const [removed] = materials.splice(fromIndex, 1)
      materials.splice(toIndex, 0, removed)

      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          user: {
            ...bp.user,
            materials
          }
        }
      })
    }
  }
)

/**
 * Write atom: Change blueprint material quantity (edit mode)
 */
export const changeBlueprintMaterialQuantityAtom = atom(
  null,
  (get, set, bpName: string, index: number, quantity: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.user?.materials && bp.user.materials[index]) {
      const materials = [...bp.user.materials]
      materials[index] = { ...materials[index], quantity }

      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          user: {
            ...bp.user,
            materials
          }
        }
      })
    }
  }
)

/**
 * Write atom: Change blueprint material name (edit mode)
 */
export const changeBlueprintMaterialNameAtom = atom(
  null,
  (get, set, bpName: string, index: number, name: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.user?.materials && bp.user.materials[index]) {
      const materials = [...bp.user.materials]
      materials[index] = { ...materials[index], name }

      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          user: {
            ...bp.user,
            materials
          }
        }
      })
    }
  }
)

/**
 * Write atom: Start blueprint edit mode
 */
export const startBlueprintEditModeAtom = atom(
  null,
  (get, set, bpName: string) => {
    set(editModeBlueprintNameAtom, bpName)
  }
)

/**
 * Write atom: End blueprint edit mode
 */
export const endBlueprintEditModeAtom = atom(
  null,
  (get, set) => {
    set(editModeBlueprintNameAtom, undefined)
  }
)

/**
 * Write atom: Move all budget materials (consolidate materials)
 */
export const moveAllBudgetPageMaterialAtom = atom(
  null,
  (get, set, bpName: string, fromMaterial: string, toMaterial: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.budget?.sheet?.materials) {
      const materials = { ...bp.budget.sheet.materials }
      const fromData = materials[fromMaterial]

      if (fromData && materials[toMaterial]) {
        // Add fromMaterial's data to toMaterial
        materials[toMaterial] = {
          ...materials[toMaterial],
          markup: fromData.markup,
          count: (materials[toMaterial].count ?? 0) + (fromData.count ?? 0)
        }

        // Remove fromMaterial
        delete materials[fromMaterial]

        set(blueprintsAtom, {
          ...blueprints,
          [bpName]: {
            ...bp,
            budget: {
              ...bp.budget,
              sheet: {
                ...bp.budget.sheet,
                materials
              }
            }
          }
        })
      }
    }
  }
)

/**
 * Write atom: Save crafting session
 * This triggers async operations in middleware (budget sheet operations)
 */
export const saveCraftingSessionAtom = atom(
  null,
  (get, set, bpName: string) => {
    const blueprints = get(blueprintsAtom)
    const bp = blueprints[bpName]

    if (bp?.session) {
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: {
          ...bp,
          session: {
            ...bp.session,
            step: STEP_SAVING
          }
        }
      })
    }
  }
)

/**
 * Write atom: Set entire craft state (used during migration to sync from Redux)
 */
export const setCraftStateAtom = atom(
  null,
  (get, set, newState: CraftState) => {
    set(blueprintsAtom, newState.blueprints)
    set(staredAtom, newState.stared)
    set(craftOptionsAtom, newState.options)
    set(activeSessionAtom, newState.activeSession)
    set(activePlanetAtom, newState.activePlanet)
    set(editModeBlueprintNameAtom, newState.editModeBlueprintName)
    set(craftWebDataAtom, newState.web)
  }
)

/**
 * Effect atom: Initialize blueprint loading on app start
 * Triggers loading of blueprint web data for stored blueprints
 */
export const initializeCraftStateAtom = atom(null, (get, set) => {
  const blueprints = get(blueprintsAtom)

  // Trigger loading of blueprint data for each blueprint
  for (const bpName of Object.keys(blueprints || {})) {
    const bp = blueprints[bpName]
    if (bp && !bp.web?.blueprint?.loading) {
      // Schedule blueprint loading
      set(loadCraftBlueprintAtom, bpName).catch((err: any) => {
        console.warn(`Failed to load blueprint ${bpName} on init:`, err)
      })
    }
  }
})

/**
 * Write atom to load item data from web
 * Replaces Redux loadItemUsageData action
 */
export const loadCraftBlueprintAtom = atom(null, async (get, set, bpName: string) => {

  const { loadFromWebMultiple } = await import('../../../web/loader')
  try {
    const renamedBpName = renameNewBlueprintName(bpName)
    let names: string[] = renamedBpName !== bpName ? [bpName, renamedBpName] : [bpName]

    for await (const r of loadFromWebMultiple(names, (s: IWebSource, n: string) => s.loadBlueprint(n))) {
      if (renamedBpName !== bpName && r.data?.value.name === renamedBpName) {
        r.data.value.name = bpName
        r.data.value.item.name = itemNameFromBpName(bpName)
      }

      const blueprints = get(blueprintsAtom)
      const current = blueprints[bpName]
      const update: BlueprintData = {
        ...current,
        web: {
          ...current?.web,
          blueprint: r
        }
      }
      set(blueprintsAtom, {
        ...blueprints,
        [bpName]: update
      })
    }
  } catch (error) {
    console.error(`Failed to load blueprint ${bpName} data:`, error)
  }
})

/**
 * Write atom to load material data for a blueprint's materials
 * Ensures all materials in a blueprint have their web data (type, value) loaded
 */
export const loadBlueprintMaterialDataAtom = atom(
  null,
  async (get, set, bpName: string) => {
    try {
      const blueprints = get(blueprintsAtom)
      const bp = blueprints[bpName]

      if (!bp?.user?.materials) {
        return
      }

      // Load material data for each material in the blueprint
      for (const material of bp.user.materials) {
        try {
          // Use dynamic import to avoid circular dependencies
          const { loadFromWeb } = await import('../../../web/loader')
          const itemsMap = get(itemsMapAtom)
          const current = itemsMap[material.name]

          // Load item web data if not already loaded
          if (!current?.web?.item?.data) {
            for await (const r of loadFromWeb((s: any) => s.loadItem(material.name))) {
              const updatedItemsMap = get(itemsMapAtom)
              const updatedCurrent = updatedItemsMap[material.name]
              const update = {
                ...updatedCurrent,
                web: {
                  ...updatedCurrent?.web,
                  item: r
                }
              } as any

              set(itemsMapAtom, {
                ...updatedItemsMap,
                [material.name]: update
              })
            }
          }
        } catch (error) {
          console.warn(`Failed to load material data for ${material.name}:`, error)
        }
      }
    } catch (error) {
      console.error(`Failed to load blueprint material data for ${bpName}:`, error)
    }
  }
)

/**
 * Write atom: Load budget sheet for a blueprint
 * Handles the complete loading workflow including stages and error handling
 */
export const loadBudgetSheetAtom = atom(
  null,
  async (get, set, bpName: string) => {
    try {
      // Dynamically import API and helper modules
      const { default: api } = await import('../../services/api')
      const { settingsAtom } = await import('./settings')

      // Start loading
      set(startBudgetPageLoadingAtom, bpName)

      // Get settings from Jotai store using atom context
      const settings = get(settingsAtom)

      // Stage tracking for API callbacks
      const setStage = (stage: number) => {
        set(setBudgetPageStageAtom, bpName, stage)
      }

      // Get blueprint and items for budget info
      const blueprints = get(blueprintsAtom)
      const bp = blueprints[bpName]

      if (!bp) {
        set(errorBudgetPageLoadingAtom, bpName, 'Blueprint not found')
        return
      }

      // TODO: Need access to full redux state to get items map for budgetInfoFromBp
      // For now, create budget info with basic material data
      const budgetInfo = {
        itemName: itemNameFromBpName(bpName),
        materials: bp.user?.materials?.map(m => ({
          name: m.name,
          unitValue: 0,
          markup: 1
        }))
      }

      // Load budget sheet from API
      const sheet = await api.sheets.loadBudgetSheet(settings, setStage, budgetInfo, false)

      if (sheet) {
        // Extract the info from the sheet
        // This will be populated by the sheet object
        const sheetInfo = {
          total: 0,
          totalMU: 0,
          peds: 0,
          materials: {}
        }

        // Set budget page info with the sheet data
        set(setBudgetPageInfoAtom, bpName, sheetInfo)
      } else {
        set(errorBudgetPageLoadingAtom, bpName, 'Failed to load budget sheet')
      }

      // End loading
      set(endBudgetPageLoadingAtom, bpName)
    } catch (error: any) {
      console.error(`Failed to load budget sheet for ${bpName}:`, error)
      set(errorBudgetPageLoadingAtom, bpName, error?.message || 'Unknown error')
    }
  }
)