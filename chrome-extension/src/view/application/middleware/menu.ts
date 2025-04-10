import { CRAFT_PAGE, selectMenu, SELECT_FOR_ACTION, tabOrder, EMPTY_PAGE, tabShow } from "../actions/menu"
import { setBlueprintActivePage, setBlueprintStared } from "../actions/craft"
import { CraftState } from "../state/craft"
import { getCraft } from "../selectors/craft"
import { InventoryState } from "../state/inventory"
import { getInventory } from "../selectors/inventory"
import { bpDataFromItemName, bpNameFromItemName } from "../helpers/craft"
import { MODE_SHOW_VISIBLE_TOGGLE } from "../actions/mode"
import { getSelectedMenu } from "../selectors/menu"
import { getVisible } from "../selectors/expandable"
import { getLast } from "../selectors/last"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case SELECT_FOR_ACTION: {
            dispatch(selectMenu(action.payload.menu))

            if (action.payload.menu === CRAFT_PAGE) {
                const state: CraftState = getCraft(getState())
                const expBpName = bpDataFromItemName(state, action.payload.name)?.name
                if (expBpName) {
                    dispatch(setBlueprintActivePage(expBpName))
                } else {
                    const inv: InventoryState = getInventory(getState())
                    const addBpName = bpNameFromItemName(inv, action.payload.name)
                    if (addBpName)
                        dispatch(setBlueprintStared(addBpName, true))
                }
            }
            break
        }
        case MODE_SHOW_VISIBLE_TOGGLE: {
            if (!action.payload.showVisibleToggle) {
                const menu = getSelectedMenu(getState())
                const visibleSelector = `tab.${menu}`;
                const visible: boolean = getVisible(visibleSelector)(getState())
                if (!visible) {
                    const { show } = getLast(getState())
                    const isTabVisible = (id: number) => getVisible(`tab.${id}`)(getState()) && tabShow(id, show)
                    const index = tabOrder.findIndex((id) => id === menu)
                    const firstVisibleAfter = tabOrder.find((id, i) => i > index && isTabVisible(id))
                    if (firstVisibleAfter) {
                        dispatch(selectMenu(firstVisibleAfter))
                    } else {
                        const firstVisibleBefore = tabOrder.find((id, i) => i < index && isTabVisible(id))
                        dispatch(selectMenu(firstVisibleBefore ?? EMPTY_PAGE))
                    }
                }
            }
            break
        }
    }
}

export default [
    requests
]