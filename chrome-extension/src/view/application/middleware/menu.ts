import { CRAFT_PAGE, selectMenu, SELECT_FOR_ACTION, tabOrder, EMPTY_PAGE, SELECT_MENU } from "../actions/menu"
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
import { getSettings } from "../selectors/settings"
import { tabShow } from "../helpers/menu"
import { SET_SETTING_STATE } from "../actions/settings"
import { PAGE_LOADED } from "../actions/ui"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const menu = await api.storage.loadMenu()
            if (menu)
                dispatch(selectMenu(menu))
            break
        }
        case SELECT_MENU: {
            const menu = action.payload.menu
            await api.storage.saveMenu(menu)
            break
        }
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
    }

    switch (action.type) {
        case MODE_SHOW_VISIBLE_TOGGLE:
        case SET_SETTING_STATE:
        case PAGE_LOADED: {
            if (action.type !== MODE_SHOW_VISIBLE_TOGGLE || !action.payload.showVisibleToggle) {
                const menu = getSelectedMenu(getState())
                if (menu === EMPTY_PAGE)
                    break

                const { c: { show } } = getLast(getState())
                const settings = getSettings(getState())
                const isTabVisible = (id: number) => getVisible(`tab.${id}`)(getState()) && tabShow(id, show, settings)
                if (isTabVisible(menu))
                    break

                // move selected menu to first visible one
                const index = tabOrder.findIndex((id) => id === menu)
                const firstVisibleAfter = tabOrder.find((id, i) => i > index && isTabVisible(id))
                if (firstVisibleAfter) {
                    dispatch(selectMenu(firstVisibleAfter))
                } else {
                    const firstVisibleBefore = tabOrder.find((id, i) => i < index && isTabVisible(id))
                    dispatch(selectMenu(firstVisibleBefore ?? EMPTY_PAGE))
                }
            }
            break
        }
    }
}

export default [
    requests
]