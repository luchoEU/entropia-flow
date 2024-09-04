import { BudgetState, BudgetMaterialsMap, BudgetItem } from "../state/budget"

const SET_BUDGET_STATE = '[budget] set state'
const SET_BUDGET_FROM_SHEET = '[budget] set from sheet'
const SET_BUDGET_MATERIAL_LIST_EXPANDED = '[budget] set material list expanded'
const SET_BUDGET_MATERIAL_EXPANDED = '[budget] set material expanded'
const SET_BUDGET_STAGE = '[budget] set stage'
const SET_BUDGET_LIST_EXPANDED = '[budget] set list expanded'
const SET_BUDGET_DISABLED_EXPANDED = '[budget] set disabled expanded'
const ENABLE_BUDGET_ITEM = '[budget] enable item'
const DISABLE_BUDGET_ITEM = '[budget] disable item'
const ENABLE_BUDGET_MATERIAL = '[budget] enable material'
const DISABLE_BUDGET_MATERIAL = '[budget] disable material'
const REFRESH_BUDGET = '[budget] refresh'
const ADD_BUDGET_MATERIAL_SELECTION = '[budget] add material selection'
const REMOVE_BUDGET_MATERIAL_SELECTION = '[budget] remove material selection'

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

const setBudgetMaterialListExpanded = (expanded: boolean) => ({
    type: SET_BUDGET_MATERIAL_LIST_EXPANDED,
    payload: {
        expanded
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

const setBudgetListExpanded = (expanded: boolean) => ({
    type: SET_BUDGET_LIST_EXPANDED,
    payload: {
        expanded
    }
})

const setBudgetDisabledExpanded = (expanded: boolean) => ({
    type: SET_BUDGET_DISABLED_EXPANDED,
    payload: {
        expanded
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

export {
    SET_BUDGET_STATE,
    SET_BUDGET_FROM_SHEET,
    SET_BUDGET_MATERIAL_LIST_EXPANDED,
    SET_BUDGET_MATERIAL_EXPANDED,
    SET_BUDGET_STAGE,
    SET_BUDGET_LIST_EXPANDED,
    SET_BUDGET_DISABLED_EXPANDED,
    ENABLE_BUDGET_ITEM,
    DISABLE_BUDGET_ITEM,
    ENABLE_BUDGET_MATERIAL,
    DISABLE_BUDGET_MATERIAL,
    ADD_BUDGET_MATERIAL_SELECTION,
    REMOVE_BUDGET_MATERIAL_SELECTION,
    REFRESH_BUDGET,
    setBudgetState,
    setBudgetFromSheet,
    setBudgetMaterialListExpanded,
    setBudgetMaterialExpanded,
    setBudgetStage,
    setBudgetListExpanded,
    setBudgetDisabledExpanded,
    enableBudgetItem,
    disableBudgetItem,
    enableBudgetMaterial,
    disableBudgetMaterial,
    addBudgetMaterialSelection,
    removeBudgetMaterialSelection,
    refreshBudget,
}
