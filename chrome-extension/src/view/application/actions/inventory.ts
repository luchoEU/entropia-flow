import { Inventory } from "../../../common/state"
import { InventoryState } from "../state/inventory"

const LOAD_INVENTORY_STATE = "[inv] load state"
const SET_CURRENT_INVENTORY = "[inv] set current"
const SET_VISIBLE_EXPANDED = "[inv] set visible expanded"
const SET_HIDDEN_EXPANDED = "[inv] set hidden expanded"
const SORT_VISIBLE_BY = "[inv] sort visible by"
const SORT_HIDDEN_BY = "[inv] sort hidden by"
const MOVE_TO_HIDDEN = "[inv] move to hidden"
const MOVE_TO_VISIBLE = "[inv] move to visible"

const loadInventoryState = (state: InventoryState) => ({
    type: LOAD_INVENTORY_STATE,
    payload: {
        state
    }
})

const setCurrentInventory = (inventory: Inventory) => ({
    type: SET_CURRENT_INVENTORY,
    payload: {
        inventory
    }
})

const setVisibleInventoryExpanded = (expanded: boolean) => ({
    type: SET_VISIBLE_EXPANDED,
    payload: {
        expanded
    }
})

const setHiddenInventoryExpanded = (expanded: boolean) => ({
    type: SET_HIDDEN_EXPANDED,
    payload: {
        expanded
    }
})

const sortVisibleBy = (part: number) => ({
    type: SORT_VISIBLE_BY,
    payload: {
        part
    }
})

const sortHiddenBy = (part: number) => ({
    type: SORT_HIDDEN_BY,
    payload: {
        part
    }
})

const moveToHidden = (name: string) => ({
    type: MOVE_TO_HIDDEN,
    payload: {
        name
    }
})

const moveToVisible = (name: string) => ({
    type: MOVE_TO_VISIBLE,
    payload: {
        name
    }
})

export {
    LOAD_INVENTORY_STATE,
    SET_CURRENT_INVENTORY,
    SET_VISIBLE_EXPANDED,
    SET_HIDDEN_EXPANDED,
    SORT_VISIBLE_BY,
    SORT_HIDDEN_BY,
    MOVE_TO_HIDDEN,
    MOVE_TO_VISIBLE,
    loadInventoryState,
    setCurrentInventory,
    setVisibleInventoryExpanded,
    setHiddenInventoryExpanded,
    sortVisibleBy,
    sortHiddenBy,
    moveToHidden,
    moveToVisible
}