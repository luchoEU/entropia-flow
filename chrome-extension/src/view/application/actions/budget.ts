import { BudgetLineData } from "../../services/api/sheets/sheetsBudget"
import { BudgetState, BudgetMaterialsMap, BudgetItem } from "../state/budget"

const SET_BUDGET_STATE = '[budget] set state'

const SET_BUDGET_FROM_SHEET = '[budget] set from sheet'
const SET_BUDGET_MATERIAL_EXPANDED = '[budget] set material expanded'
const SET_BUDGET_STAGE = '[budget] set stage'
const ENABLE_BUDGET_ITEM = '[budget] enable item'
const DISABLE_BUDGET_ITEM = '[budget] disable item'
const ENABLE_BUDGET_MATERIAL = '[budget] enable material'
const DISABLE_BUDGET_MATERIAL = '[budget] disable material'
const REFRESH_BUDGET = '[budget] refresh'
const ADD_BUDGET_MATERIAL_SELECTION = '[budget] add material selection'
const REMOVE_BUDGET_MATERIAL_SELECTION = '[budget] remove material selection'
const PROCESS_BUDGET_MATERIAL_SELECTION = '[budget] process material selection'
const SEND_BUDGET_PENDING_LINES = '[budget] send pending lines'
const ADD_BUDGET_GROUP = '[budget] add group'
const REMOVE_BUDGET_GROUP = '[budget] remove group'
const RENAME_BUDGET_GROUP = '[budget] rename group'
const MOVE_ITEM_TO_GROUP = '[budget] move item to group'
const TOGGLE_BUDGET_GROUP_EXPANDED = '[budget] toggle group expanded'
const TOGGLE_BUDGET_UNGROUPED_EXPANDED = '[budget] toggle ungrouped expanded'
const ADD_BUDGET_ITEM_PENDING_LINES = '[budget] add item pending lines'
const CLEAR_BUDGET_ITEM_PENDING_LINES = '[budget] clear item pending lines'
const REMOVE_BUDGET_ITEM_PENDING_LINES = '[budget] remove item pending lines'
const DELETE_BUDGET_PENDING_LINE = '[budget] delete pending line'
const UPDATE_BUDGET_PENDING_LINE = '[budget] update pending line'

const setBudgetState = (state: BudgetState) => ({
    type: SET_BUDGET_STATE,
    payload: {
        state
    }
})

const setBudgetFromSheet = (map: BudgetMaterialsMap, items: BudgetItem[], loadPercentage: number) => ({
    type: SET_BUDGET_FROM_SHEET,
    payload: {
        map,
        items,
        loadPercentage
    }
})

const setBudgetMaterialExpanded = (material: string) => (expanded: boolean) => ({
    type: SET_BUDGET_MATERIAL_EXPANDED,
    payload: {
        material,
        expanded
    }
})

const setBudgetStage = (stage: number) => ({
    type: SET_BUDGET_STAGE,
    payload: {
        stage
    }
})

const enableBudgetItem = (name: string) => ({
    type: ENABLE_BUDGET_ITEM,
    payload: {
        name
    }
})

const disableBudgetItem = (name: string) => ({
    type: DISABLE_BUDGET_ITEM,
    payload: {
        name
    }
})

const refreshBudget = {
    type: REFRESH_BUDGET
}

const enableBudgetMaterial = (itemName: string, materialName: string) => ({
    type: ENABLE_BUDGET_MATERIAL,
    payload: {
        itemName,
        materialName
    }
})

const disableBudgetMaterial = (itemName: string, materialName: string) => ({
    type: DISABLE_BUDGET_MATERIAL,
    payload: {
        itemName,
        materialName
    }
})

const addBudgetMaterialSelection = (materialName: string) => ({
    type: ADD_BUDGET_MATERIAL_SELECTION,
    payload: {
        materialName
    }
})

const removeBudgetMaterialSelection = (materialName: string) => ({
    type: REMOVE_BUDGET_MATERIAL_SELECTION,
    payload: {
        materialName
    }
})

const processBudgetMaterialSelection = () => ({
    type: PROCESS_BUDGET_MATERIAL_SELECTION
})

const sendBudgetPendingLines = (pendingLines: { [itemName: string]: BudgetLineData[] }) => ({
    type: SEND_BUDGET_PENDING_LINES,
    payload: { pendingLines }
})

const addBudgetGroup = (name: string) => ({
    type: ADD_BUDGET_GROUP,
    payload: { name }
})

const removeBudgetGroup = (groupId: string) => ({
    type: REMOVE_BUDGET_GROUP,
    payload: { groupId }
})

const renameBudgetGroup = (groupId: string, name: string) => ({
    type: RENAME_BUDGET_GROUP,
    payload: { groupId, name }
})

const moveItemToGroup = (itemName: string, groupId: string | null) => ({
    type: MOVE_ITEM_TO_GROUP,
    payload: { itemName, groupId }
})

const toggleBudgetGroupExpanded = (groupId: string) => ({
    type: TOGGLE_BUDGET_GROUP_EXPANDED,
    payload: { groupId }
})

const toggleBudgetUngroupedExpanded = () => ({
    type: TOGGLE_BUDGET_UNGROUPED_EXPANDED
})

const addBudgetItemPendingLines = (itemName: string, lines: BudgetLineData[]) => ({
    type: ADD_BUDGET_ITEM_PENDING_LINES,
    payload: { itemName, lines }
})

const removeBudgetItemPendingLines = (itemName: string, lines: BudgetLineData[]) => ({
    type: REMOVE_BUDGET_ITEM_PENDING_LINES,
    payload: { itemName, lines }
})

const clearBudgetItemPendingLines = (itemName: string) => ({
    type: CLEAR_BUDGET_ITEM_PENDING_LINES,
    payload: { itemName }
})

const deleteBudgetPendingLine = (itemName: string, lineIndex: number) => ({
    type: DELETE_BUDGET_PENDING_LINE,
    payload: { itemName, lineIndex }
})

const updateBudgetPendingLine = (itemName: string, lineIndex: number, ped: number, materials: { name: string, quantity: number }[]) => ({
    type: UPDATE_BUDGET_PENDING_LINE,
    payload: { itemName, lineIndex, ped, materials }
})

export {
    SET_BUDGET_STATE,
    SET_BUDGET_FROM_SHEET,
    SET_BUDGET_MATERIAL_EXPANDED,
    SET_BUDGET_STAGE,
    ENABLE_BUDGET_ITEM,
    DISABLE_BUDGET_ITEM,
    ENABLE_BUDGET_MATERIAL,
    DISABLE_BUDGET_MATERIAL,
    ADD_BUDGET_MATERIAL_SELECTION,
    REMOVE_BUDGET_MATERIAL_SELECTION,
    REFRESH_BUDGET,
    PROCESS_BUDGET_MATERIAL_SELECTION,
    SEND_BUDGET_PENDING_LINES,
    ADD_BUDGET_GROUP,
    REMOVE_BUDGET_GROUP,
    RENAME_BUDGET_GROUP,
    MOVE_ITEM_TO_GROUP,
    TOGGLE_BUDGET_GROUP_EXPANDED,
    TOGGLE_BUDGET_UNGROUPED_EXPANDED,
    ADD_BUDGET_ITEM_PENDING_LINES,
    CLEAR_BUDGET_ITEM_PENDING_LINES,
    REMOVE_BUDGET_ITEM_PENDING_LINES,
    DELETE_BUDGET_PENDING_LINE,
    UPDATE_BUDGET_PENDING_LINE,
    setBudgetState,
    setBudgetFromSheet,
    setBudgetMaterialExpanded,
    setBudgetStage,
    enableBudgetItem,
    disableBudgetItem,
    enableBudgetMaterial,
    disableBudgetMaterial,
    addBudgetMaterialSelection,
    removeBudgetMaterialSelection,
    refreshBudget,
    processBudgetMaterialSelection,
    sendBudgetPendingLines,
    addBudgetGroup,
    removeBudgetGroup,
    renameBudgetGroup,
    moveItemToGroup,
    toggleBudgetGroupExpanded,
    toggleBudgetUngroupedExpanded,
    addBudgetItemPendingLines,
    clearBudgetItemPendingLines,
    removeBudgetItemPendingLines,
    deleteBudgetPendingLine,
    updateBudgetPendingLine
}
