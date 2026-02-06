import { atom } from 'jotai'
import { BudgetState, BudgetMaterialsMap, BudgetItem } from '../state/budget'
import { BudgetLineData } from '../../services/api/sheets/sheetsBudget'
import {
  initialState,
  setState,
  reduceSetBudgetFromSheet,
  setBudgetMaterialExpanded,
  setBudgetStage,
  reduceEnableBudgetItem,
  reduceDisableBudgetItem,
  reduceEnableBudgetMaterial,
  reduceDisableBudgetMaterial,
  reduceAddBudgetGroup,
  reduceRemoveBudgetGroup,
  reduceRenameBudgetGroup,
  reduceMoveItemToGroup,
  reduceToggleBudgetGroupExpanded,
  reduceToggleBudgetUngroupedExpanded,
  reduceAddBudgetItemPendingLines,
  reduceClearBudgetItemPendingLines,
  reduceDeleteBudgetPendingLine,
  reduceUpdateBudgetPendingLine,
  reduceRemoveBudgetItemPendingLines,
  reduceToggleBudgetShowDisabled,
  reduceEnableBudgetGroup,
  reduceDisableBudgetGroup
} from '../helpers/budget'

// Base atoms
export const budgetStageAtom = atom<number>(initialState.stage)
export const budgetLoadPercentageAtom = atom<number>(initialState.loadPercentage)
export const budgetMaterialsAtom = atom(initialState.materials)
export const budgetListAtom = atom(initialState.list)
export const budgetGroupsAtom = atom(initialState.groups)

// Computed state atom
export const budgetStateAtom = atom((get) => ({
  stage: get(budgetStageAtom),
  loadPercentage: get(budgetLoadPercentageAtom),
  materials: get(budgetMaterialsAtom),
  list: get(budgetListAtom),
  groups: get(budgetGroupsAtom)
} as BudgetState))

// Write atoms - State management
export const setBudgetStateAtom = atom(
  null,
  (get, set, newState: BudgetState) => {
    set(budgetStageAtom, newState.stage)
    set(budgetLoadPercentageAtom, newState.loadPercentage)
    set(budgetMaterialsAtom, newState.materials)
    set(budgetListAtom, newState.list)
    set(budgetGroupsAtom, newState.groups)
  }
)

export const setBudgetFromSheetAtom = atom(
  null,
  (get, set, map: BudgetMaterialsMap, items: BudgetItem[], loadPercentage: number) => {
    const state = get(budgetStateAtom)
    const updated = reduceSetBudgetFromSheet(state, map, items, loadPercentage)
    set(budgetMaterialsAtom, updated.materials)
    set(budgetListAtom, updated.list)
    set(budgetLoadPercentageAtom, updated.loadPercentage)
  }
)

export const setBudgetMaterialExpandedAtom = atom(
  null,
  (get, set, material: string, expanded: boolean) => {
    const state = get(budgetStateAtom)
    const updated = setBudgetMaterialExpanded(state, material, expanded)
    set(budgetMaterialsAtom, updated.materials)
  }
)

export const setBudgetStageAtom = atom(
  null,
  (get, set, stage: number) => {
    const state = get(budgetStateAtom)
    const updated = setBudgetStage(state, stage)
    set(budgetStageAtom, updated.stage)
    set(budgetLoadPercentageAtom, updated.loadPercentage)
  }
)

// Write atoms - Items
export const enableBudgetItemAtom = atom(
  null,
  (get, set, name: string) => {
    const state = get(budgetStateAtom)
    const updated = reduceEnableBudgetItem(state, name)
    set(budgetListAtom, updated.list)
  }
)

export const disableBudgetItemAtom = atom(
  null,
  (get, set, name: string) => {
    const state = get(budgetStateAtom)
    const updated = reduceDisableBudgetItem(state, name)
    set(budgetListAtom, updated.list)
    set(budgetMaterialsAtom, updated.materials)
  }
)

// Write atoms - Materials
export const enableBudgetMaterialAtom = atom(
  null,
  (get, set, itemName: string, materialName: string) => {
    const state = get(budgetStateAtom)
    const updated = reduceEnableBudgetMaterial(state, itemName, materialName)
    set(budgetMaterialsAtom, updated.materials)
  }
)

export const disableBudgetMaterialAtom = atom(
  null,
  (get, set, itemName: string, materialName: string) => {
    const state = get(budgetStateAtom)
    const updated = reduceDisableBudgetMaterial(state, itemName, materialName)
    set(budgetMaterialsAtom, updated.materials)
  }
)

// Write atoms - Groups
export const addBudgetGroupAtom = atom(
  null,
  (get, set, name: string) => {
    const state = get(budgetStateAtom)
    const updated = reduceAddBudgetGroup(state, name)
    set(budgetGroupsAtom, updated.groups)
  }
)

export const removeBudgetGroupAtom = atom(
  null,
  (get, set, groupId: string) => {
    const state = get(budgetStateAtom)
    const updated = reduceRemoveBudgetGroup(state, groupId)
    set(budgetGroupsAtom, updated.groups)
  }
)

export const renameBudgetGroupAtom = atom(
  null,
  (get, set, groupId: string, name: string) => {
    const state = get(budgetStateAtom)
    const updated = reduceRenameBudgetGroup(state, groupId, name)
    set(budgetGroupsAtom, updated.groups)
  }
)

export const moveBudgetItemToGroupAtom = atom(
  null,
  (get, set, itemName: string, groupId: string | null) => {
    const state = get(budgetStateAtom)
    const updated = reduceMoveItemToGroup(state, itemName, groupId)
    set(budgetGroupsAtom, updated.groups)
  }
)

export const toggleBudgetGroupExpandedAtom = atom(
  null,
  (get, set, groupId: string) => {
    const state = get(budgetStateAtom)
    const updated = reduceToggleBudgetGroupExpanded(state, groupId)
    set(budgetGroupsAtom, updated.groups)
  }
)

export const toggleBudgetUngroupedExpandedAtom = atom(
  null,
  (get, set) => {
    const state = get(budgetStateAtom)
    const updated = reduceToggleBudgetUngroupedExpanded(state)
    set(budgetGroupsAtom, updated.groups)
  }
)

export const enableBudgetGroupAtom = atom(
  null,
  (get, set, groupId: string) => {
    const state = get(budgetStateAtom)
    const updated = reduceEnableBudgetGroup(state, groupId)
    set(budgetGroupsAtom, updated.groups)
  }
)

export const disableBudgetGroupAtom = atom(
  null,
  (get, set, groupId: string) => {
    const state = get(budgetStateAtom)
    const updated = reduceDisableBudgetGroup(state, groupId)
    set(budgetGroupsAtom, updated.groups)
  }
)

// Write atoms - Pending Lines
export const addBudgetItemPendingLinesAtom = atom(
  null,
  (get, set, itemName: string, lines: BudgetLineData[]) => {
    const state = get(budgetStateAtom)
    const updated = reduceAddBudgetItemPendingLines(state, itemName, lines)
    set(budgetListAtom, updated.list)
  }
)

export const clearBudgetItemPendingLinesAtom = atom(
  null,
  (get, set, itemName: string) => {
    const state = get(budgetStateAtom)
    const updated = reduceClearBudgetItemPendingLines(state, itemName)
    set(budgetListAtom, updated.list)
  }
)

export const deleteBudgetPendingLineAtom = atom(
  null,
  (get, set, itemName: string, lineIndex: number) => {
    const state = get(budgetStateAtom)
    const updated = reduceDeleteBudgetPendingLine(state, itemName, lineIndex)
    set(budgetListAtom, updated.list)
  }
)

export const updateBudgetPendingLineAtom = atom(
  null,
  (get, set, itemName: string, lineIndex: number, ped: number, materials: { name: string, quantity: number }[]) => {
    const state = get(budgetStateAtom)
    const updated = reduceUpdateBudgetPendingLine(state, itemName, lineIndex, ped, materials)
    set(budgetListAtom, updated.list)
  }
)

export const removeBudgetItemPendingLinesAtom = atom(
  null,
  (get, set, itemName: string, lines: BudgetLineData[]) => {
    const state = get(budgetStateAtom)
    const updated = reduceRemoveBudgetItemPendingLines(state, itemName, lines)
    set(budgetListAtom, updated.list)
  }
)

// Write atoms - UI
export const toggleBudgetShowDisabledAtom = atom(
  null,
  (get, set) => {
    const state = get(budgetStateAtom)
    const updated = reduceToggleBudgetShowDisabled(state)
    set(budgetListAtom, updated.list)
  }
)

// Atom factory for getting a single budget item by name
const getBudgetItemCache = new Map<string, any>()

export const getBudgetItemAtom = (name: string) => {
  if (!getBudgetItemCache.has(name)) {
    getBudgetItemCache.set(name, atom((get) => {
      const list = get(budgetListAtom)
      return list.items.find(item => item.name === name)
    }))
  }
  return getBudgetItemCache.get(name)
}
