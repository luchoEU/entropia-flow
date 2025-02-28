import { mergeDeep } from "../../../common/merge"
import { SET_BLUEPRINT_PARTIAL_WEB_DATA, SET_BLUEPRINT_STARED, SET_CRAFT_STATE } from "../actions/craft"
import { ADD_AVAILABLE, CANCEL_BY_STORE_ITEM_NAME_EDITING, CANCEL_BY_STORE_STARED_ITEM_NAME_EDITING, CONFIRM_BY_STORE_ITEM_NAME_EDITING, CONFIRM_BY_STORE_STARED_ITEM_NAME_EDITING, HIDE_BY_CONTAINER, HIDE_BY_NAME, HIDE_BY_VALUE, LOAD_INVENTORY_STATE, LOAD_TRADING_ITEM_DATA, loadInventoryState, loadTradingItemData, REMOVE_AVAILABLE, SET_AUCTION_EXPANDED, SET_AVAILABLE_EXPANDED, SET_BLUEPRINTS_EXPANDED, SET_BLUEPRINTS_FILTER, SET_BY_STORE_ALL_ITEMS_EXPANDED, SET_BY_STORE_CRAFT_FILTER, SET_BY_STORE_CRAFT_ITEM_EXPANDED, SET_BY_STORE_EXPANDED, SET_BY_STORE_FILTER, SET_BY_STORE_ITEM_EXPANDED, SET_BY_STORE_ITEM_NAME, SET_BY_STORE_ITEM_STARED, SET_BY_STORE_STARED_ALL_ITEMS_EXPANDED, SET_BY_STORE_STARED_EXPANDED, SET_BY_STORE_STARED_FILTER, SET_BY_STORE_STARED_ITEM_EXPANDED, SET_BY_STORE_STARED_ITEM_NAME, SET_BY_STORE_STARED_ITEM_STARED, SET_CURRENT_INVENTORY, SET_HIDDEN_EXPANDED, SET_HIDDEN_FILTER, SET_VISIBLE_EXPANDED, SET_VISIBLE_FILTER, SHOW_ALL, SHOW_BY_CONTAINER, SHOW_BY_NAME, SHOW_BY_VALUE, SHOW_TRADING_ITEM_DATA, SORT_AUCTION_BY, SORT_AVAILABLE_BY, SORT_BY_STORE_BY, SORT_BY_STORE_CRAFT_BY, SORT_BY_STORE_STARED_BY, SORT_HIDDEN_BY, SORT_TRADE_FAVORITE_BLUEPRINTS_BY, SORT_TRADE_OTHER_BLUEPRINTS_BY, SORT_TRADE_OWNED_BLUEPRINTS_BY, SORT_VISIBLE_BY, START_BY_STORE_ITEM_NAME_EDITING, START_BY_STORE_STARED_ITEM_NAME_EDITING } from "../actions/inventory"
import { loadItemUsageData, SET_MATERIAL_PARTIAL_WEB_DATA } from "../actions/materials"
import { setTabularData } from "../actions/tabular"
import { PAGE_LOADED } from "../actions/ui"
import { cleanForSave, initialState } from "../helpers/inventory"
import { cleanForSaveByStore } from "../helpers/inventory.byStore"
import { setTabularDefinitions } from "../helpers/tabular"
import { getCraft } from "../selectors/craft"
import { getInventory } from "../selectors/inventory"
import { getMaterial, getMaterials } from "../selectors/materials"
import { CraftState } from "../state/craft"
import { InventoryByStore, InventoryState } from "../state/inventory"
import { inventoryTabularData, inventoryTabularDefinitions } from "../tabular/inventory"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            setTabularDefinitions(inventoryTabularDefinitions)
            let state: InventoryState = await api.storage.loadInventoryState()
            const byStore: InventoryByStore = await api.storage.loadInventoryByStoreState()
            if (state || byStore) {
                if (!state)
                    state = initialState
                state.byStore = byStore
                dispatch(loadInventoryState(mergeDeep(initialState, state)))
            }
            break
        }
        case SET_AUCTION_EXPANDED:
        case SET_AVAILABLE_EXPANDED:
        case SET_VISIBLE_EXPANDED:
        case SET_VISIBLE_FILTER:
        case SET_HIDDEN_EXPANDED:
        case SET_HIDDEN_FILTER:
        case SET_BLUEPRINTS_EXPANDED:
        case SET_BLUEPRINTS_FILTER:
        case SORT_AUCTION_BY:
        case SORT_VISIBLE_BY:
        case SORT_HIDDEN_BY:
        case SORT_AVAILABLE_BY:
        case HIDE_BY_NAME:
        case SHOW_BY_NAME:
        case HIDE_BY_CONTAINER:
        case SHOW_BY_CONTAINER:
        case HIDE_BY_VALUE:
        case SHOW_BY_VALUE:
        case SHOW_ALL:
        case SHOW_TRADING_ITEM_DATA:
        case LOAD_TRADING_ITEM_DATA:
        case SORT_TRADE_FAVORITE_BLUEPRINTS_BY:
        case SORT_TRADE_OWNED_BLUEPRINTS_BY:
        case SORT_TRADE_OTHER_BLUEPRINTS_BY:
        case ADD_AVAILABLE:
        case REMOVE_AVAILABLE: {
            const state: InventoryState = getInventory(getState())
            await api.storage.saveInventoryState(cleanForSave(state))
            break
        }
        case SET_BY_STORE_EXPANDED:
        case SET_BY_STORE_ITEM_EXPANDED:
        case SET_BY_STORE_ALL_ITEMS_EXPANDED:
        case SET_BY_STORE_FILTER:
        case SORT_BY_STORE_BY:
        case START_BY_STORE_ITEM_NAME_EDITING:
        case CONFIRM_BY_STORE_ITEM_NAME_EDITING:
        case CANCEL_BY_STORE_ITEM_NAME_EDITING:
        case SET_BY_STORE_ITEM_NAME:
        case SET_BY_STORE_ITEM_STARED:
        case SET_BY_STORE_STARED_EXPANDED:
        case SET_BY_STORE_STARED_ITEM_EXPANDED:
        case SET_BY_STORE_CRAFT_ITEM_EXPANDED:
        case SET_BY_STORE_STARED_ALL_ITEMS_EXPANDED:
        case SET_BY_STORE_STARED_FILTER:
        case SORT_BY_STORE_STARED_BY:
        case SORT_BY_STORE_CRAFT_BY:
        case START_BY_STORE_STARED_ITEM_NAME_EDITING:
        case CONFIRM_BY_STORE_STARED_ITEM_NAME_EDITING:
        case CANCEL_BY_STORE_STARED_ITEM_NAME_EDITING:
        case SET_BY_STORE_STARED_ITEM_NAME:
        case SET_BY_STORE_STARED_ITEM_STARED:
        case SET_BY_STORE_CRAFT_FILTER: {
            const state: InventoryByStore = getInventory(getState()).byStore
            await api.storage.saveInventoryByStoreState(cleanForSaveByStore(state))
            break
        }
    }

    switch (action.type) {
        case SHOW_TRADING_ITEM_DATA:
        case SET_CRAFT_STATE:
        case SET_BLUEPRINT_STARED:
        case SET_BLUEPRINT_PARTIAL_WEB_DATA:
        case SET_MATERIAL_PARTIAL_WEB_DATA: {
            const state: InventoryState = getInventory(getState())
            const name = state.tradeItemData?.name
            if (name) {
                const craftState: CraftState = getCraft(getState())
                const usage = getMaterial(name)(getState())?.web?.usage
                if (action.type === SHOW_TRADING_ITEM_DATA && !usage) {
                    dispatch(loadItemUsageData(name))
                }
                dispatch(loadTradingItemData(craftState, usage))
            }
            break
        }
    }

    switch (action.type) {
        case LOAD_INVENTORY_STATE:
        case SET_CURRENT_INVENTORY:
        case HIDE_BY_NAME:
        case SHOW_BY_NAME:
        case HIDE_BY_CONTAINER:
        case SHOW_BY_CONTAINER:
        case HIDE_BY_VALUE:
        case SHOW_BY_VALUE:
        case SHOW_ALL:
        case SHOW_TRADING_ITEM_DATA: {
            const state: InventoryState = getInventory(getState())
            dispatch(setTabularData(inventoryTabularData(state)))
            break
        }
    }
}

export default [
    requests
]
