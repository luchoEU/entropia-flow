import { mergeDeep } from "../../../common/merge"
import { SET_BLUEPRINT_PARTIAL_WEB_DATA, SET_BLUEPRINT_STARED, SET_CRAFT_STATE } from "../actions/craft"
import { ADD_AVAILABLE, CANCEL_BY_STORE_ITEM_NAME_EDITING, CANCEL_BY_STORE_STARED_ITEM_NAME_EDITING, CONFIRM_BY_STORE_ITEM_NAME_EDITING, CONFIRM_BY_STORE_STARED_ITEM_NAME_EDITING, HIDE_BY_CONTAINER, HIDE_BY_NAME, HIDE_BY_VALUE, LOAD_INVENTORY_STATE, LOAD_TRADING_ITEM_DATA, loadInventoryState, loadTradingItemData, REMOVE_AVAILABLE, SET_BY_STORE_ALL_ITEMS_EXPANDED, SET_BY_STORE_MATERIAL_FILTER, SET_BY_STORE_MATERIAL_ITEM_EXPANDED, SET_BY_STORE_FILTER, SET_BY_STORE_ITEM_EXPANDED, SET_BY_STORE_ITEM_NAME, SET_BY_STORE_ITEM_STARED, SET_BY_STORE_STARED_ALL_ITEMS_EXPANDED, SET_BY_STORE_STARED_FILTER, SET_BY_STORE_STARED_ITEM_EXPANDED, SET_BY_STORE_STARED_ITEM_NAME, SET_BY_STORE_STARED_ITEM_STARED, SET_CURRENT_INVENTORY, SHOW_ALL, SHOW_BY_CONTAINER, SHOW_BY_NAME, SHOW_BY_VALUE, SHOW_TRADING_ITEM_DATA, SORT_AUCTION_BY, SORT_AVAILABLE_BY, SORT_BY_STORE_BY, SORT_BY_STORE_MATERIAL_BY, SORT_BY_STORE_STARED_BY, SORT_TRADE_FAVORITE_BLUEPRINTS_BY, SORT_TRADE_OTHER_BLUEPRINTS_BY, SORT_TRADE_OWNED_BLUEPRINTS_BY, START_BY_STORE_ITEM_NAME_EDITING, START_BY_STORE_STARED_ITEM_NAME_EDITING, SHOW_HIDDEN_ITEMS, SET_OWNED_OPTIONS } from "../actions/inventory"
import { loadItemUsageData, ITEM_RESERVE_VALUE_CHANGED, SET_ITEM_PARTIAL_WEB_DATA, SET_ITEMS_STATE } from "../actions/items"
import { ENABLE_FEATURE } from "../actions/settings"
import { setTabularData } from "../actions/tabular"
import { SET_TT_SERVICE_PARTIAL_WEB_DATA } from "../actions/ttService"
import { cleanForSave, initialState } from "../helpers/inventory"
import { cleanForSaveByStore, fillFromLoadByStore } from "../helpers/inventory.byStore"
import { setTabularDefinitions } from "../helpers/tabular"
import { getCraft } from "../selectors/craft"
import { getInventory } from "../selectors/inventory"
import { getItem, getItemsMap } from "../selectors/items"
import { getSettings } from "../selectors/settings"
import { getTTService } from "../selectors/ttService"
import { AppAction } from "../slice/app"
import { CraftState } from "../state/craft"
import { InventoryByStore, InventoryState } from "../state/inventory"
import { ItemsMap } from "../state/items"
import { SettingsState } from "../state/settings"
import { TTServiceState } from "../state/ttService"
import { inventoryTabularData, inventoryTabularDefinitions } from "../tabular/inventory"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            setTabularDefinitions(inventoryTabularDefinitions)
            let state: InventoryState = await api.storage.loadInventoryState()
            const byStore: InventoryByStore = await api.storage.loadInventoryByStoreState()
            if (state || byStore) {
                state = state || initialState
                state.byStore = byStore && fillFromLoadByStore(byStore)
                dispatch(loadInventoryState(mergeDeep(initialState, state)))
            }
            break
        }
        case SORT_AUCTION_BY:
        case SORT_AVAILABLE_BY:
        case HIDE_BY_NAME:
        case SHOW_BY_NAME:
        case HIDE_BY_CONTAINER:
        case SHOW_BY_CONTAINER:
        case HIDE_BY_VALUE:
        case SHOW_BY_VALUE:
        case SHOW_HIDDEN_ITEMS:
        case SHOW_ALL:
        case SHOW_TRADING_ITEM_DATA:
        case LOAD_TRADING_ITEM_DATA:
        case SORT_TRADE_FAVORITE_BLUEPRINTS_BY:
        case SORT_TRADE_OWNED_BLUEPRINTS_BY:
        case SORT_TRADE_OTHER_BLUEPRINTS_BY:
        case ADD_AVAILABLE:
        case REMOVE_AVAILABLE:
        case SET_OWNED_OPTIONS: {
            const state: InventoryState = getInventory(getState())
            await api.storage.saveInventoryState(cleanForSave(state))
            break
        }
        case SET_BY_STORE_ITEM_EXPANDED:
        case SET_BY_STORE_ALL_ITEMS_EXPANDED:
        case SET_BY_STORE_FILTER:
        case SORT_BY_STORE_BY:
        case START_BY_STORE_ITEM_NAME_EDITING:
        case CONFIRM_BY_STORE_ITEM_NAME_EDITING:
        case CANCEL_BY_STORE_ITEM_NAME_EDITING:
        case SET_BY_STORE_ITEM_NAME:
        case SET_BY_STORE_ITEM_STARED:
        case SET_BY_STORE_STARED_ITEM_EXPANDED:
        case SET_BY_STORE_MATERIAL_ITEM_EXPANDED:
        case SET_BY_STORE_STARED_ALL_ITEMS_EXPANDED:
        case SET_BY_STORE_STARED_FILTER:
        case SORT_BY_STORE_STARED_BY:
        case SORT_BY_STORE_MATERIAL_BY:
        case START_BY_STORE_STARED_ITEM_NAME_EDITING:
        case CONFIRM_BY_STORE_STARED_ITEM_NAME_EDITING:
        case CANCEL_BY_STORE_STARED_ITEM_NAME_EDITING:
        case SET_BY_STORE_STARED_ITEM_NAME:
        case SET_BY_STORE_STARED_ITEM_STARED:
        case SET_BY_STORE_MATERIAL_FILTER: {
            const state: InventoryByStore = getInventory(getState()).byStore
            await api.storage.saveInventoryByStoreState(cleanForSaveByStore(state))
            break
        }
    }

    switch (action.type) {
        case SHOW_TRADING_ITEM_DATA:
        case SET_CRAFT_STATE:
        case SET_ITEMS_STATE:
        case SET_BLUEPRINT_STARED:
        case SET_BLUEPRINT_PARTIAL_WEB_DATA:
        case SET_ITEM_PARTIAL_WEB_DATA: {
            const state: InventoryState = getInventory(getState())
            if (state.tradeItemDataChain) {
                const craftState: CraftState = getCraft(getState())
                dispatch(loadTradingItemData(craftState, state.tradeItemDataChain.map((item) => {
                    const usage = getItem(item.name)(getState())?.web?.usage
                    if (action.type === SHOW_TRADING_ITEM_DATA && !usage) {
                        dispatch(loadItemUsageData(item.name))
                    }
                    return usage
                })))
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
        case SHOW_HIDDEN_ITEMS:
        case SHOW_ALL:
        case SHOW_TRADING_ITEM_DATA:
        case ENABLE_FEATURE:
        case SET_OWNED_OPTIONS:
        case ITEM_RESERVE_VALUE_CHANGED:
        case SET_ITEMS_STATE:
        case SET_TT_SERVICE_PARTIAL_WEB_DATA: {
            const state: InventoryState = getInventory(getState())
            const settings: SettingsState = getSettings(getState())
            const items: ItemsMap = getItemsMap(getState())
            const ttService: TTServiceState = getTTService(getState())
            dispatch(setTabularData(inventoryTabularData(state, settings, items, ttService)))
            break
        }
    }
}

export default [
    requests
]
