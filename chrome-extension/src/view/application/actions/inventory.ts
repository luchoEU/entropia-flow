import { Inventory } from "../../../common/state"
import { WebLoadResponse } from "../../../web/loader"
import { ItemUsageWebData } from "../../../web/state"
import { CraftState } from "../state/craft"
import { InventoryState } from "../state/inventory"

const LOAD_INVENTORY_STATE = "[inv] load state"
const SET_CURRENT_INVENTORY = "[inv] set current"
const SET_AUCTION_EXPANDED = "[inv] set auction expanded"
const SET_AVAILABLE_EXPANDED = "[inv] set available expanded"
const SET_HIDDEN_EXPANDED = "[inv] set hidden expanded"
const SET_HIDDEN_FILTER = "[inv] set hidden filter"
const SET_BLUEPRINTS_EXPANDED = "[inv] set blueprints expanded"
const SET_BLUEPRINTS_FILTER = "[inv] set blueprints filter"
const SORT_OWNED_BLUEPRINTS_BY = "[inv] sort owned blueprints by"
const SET_BY_STORE_EXPANDED = "[inv] set by store expanded"
const SET_BY_STORE_ITEM_EXPANDED = "[inv] set by store item expanded"
const SET_BY_STORE_ALL_ITEMS_EXPANDED = "[inv] set by store all items expanded"
const SET_BY_STORE_FILTER = "[inv] set by store filter"
const START_BY_STORE_ITEM_NAME_EDITING = "[inv] start by store item name editing"
const CONFIRM_BY_STORE_ITEM_NAME_EDITING = "[inv] confirm by store item name editing"
const CANCEL_BY_STORE_ITEM_NAME_EDITING = "[inv] cancel by store item name editing"
const SET_BY_STORE_ITEM_NAME = "[inv] set by store item name"
const SET_BY_STORE_ITEM_STARED = "[inv] set by store item stared"
const SET_BY_STORE_STARED_EXPANDED = "[inv] set by store stared expanded"
const SET_BY_STORE_STARED_ITEM_EXPANDED = "[inv] set by store stared item expanded"
const SET_BY_STORE_CRAFT_ITEM_EXPANDED = "[inv] set by store craft item expanded"
const SET_BY_STORE_STARED_ALL_ITEMS_EXPANDED = "[inv] set by store stared all items expanded"
const SET_BY_STORE_STARED_FILTER = "[inv] set by store stared filter"
const START_BY_STORE_STARED_ITEM_NAME_EDITING = "[inv] start by store stared item name editing"
const CONFIRM_BY_STORE_STARED_ITEM_NAME_EDITING = "[inv] confirm by store stared item name editing"
const CANCEL_BY_STORE_STARED_ITEM_NAME_EDITING = "[inv] cancel by store stared item name editing"
const SET_BY_STORE_STARED_ITEM_NAME = "[inv] set by store stared item name"
const SET_BY_STORE_STARED_ITEM_STARED = "[inv] set by store stared item stared"
const SET_BY_STORE_CRAFT_FILTER = "[inv] set by store craft filter"
const SORT_AUCTION_BY = "[inv] sort auction by"
const SORT_HIDDEN_BY = "[inv] sort hidden by"
const SORT_BY_STORE_BY = "[inv] sort by store by"
const SORT_BY_STORE_STARED_BY = "[inv] sort by store stared by"
const SORT_BY_STORE_CRAFT_BY = "[inv] sort by store craft by"
const SORT_AVAILABLE_BY = "[inv] sort available by"
const HIDE_BY_NAME = "[inv] hide by name"
const SHOW_BY_NAME = "[inv] show by name"
const HIDE_BY_CONTAINER = "[inv] hide by container"
const SHOW_BY_CONTAINER = "[inv] show by container"
const HIDE_BY_VALUE = "[inv] hide by value"
const SHOW_BY_VALUE = "[inv] show by value"
const SHOW_ALL = "[inv] show all"
const SHOW_TRADING_ITEM_DATA = "[inv] show trading item data"
const LOAD_TRADING_ITEM_DATA = "[inv] load trading item data"
const SORT_TRADE_FAVORITE_BLUEPRINTS_BY = "[inv] sort trade favorite blueprints by"
const SORT_TRADE_OWNED_BLUEPRINTS_BY = "[inv] sort trade owned blueprints by"
const SORT_TRADE_OTHER_BLUEPRINTS_BY = "[inv] sort trade other blueprint by"
const ADD_AVAILABLE = "[inv] add available"
const REMOVE_AVAILABLE = "[inv] remove available"

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

const setAuctionInventoryExpanded = (expanded: boolean) => ({
    type: SET_AUCTION_EXPANDED,
    payload: {
        expanded
    }
})

const setAvailableInventoryExpanded = (expanded: boolean) => ({
    type: SET_AVAILABLE_EXPANDED,
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

const setByStoreInventoryExpanded = (expanded: boolean) => ({
    type: SET_BY_STORE_EXPANDED,
    payload: {
        expanded
    }
})

const setByStoreItemExpanded = (id: string) => (expanded: boolean) => ({
    type: SET_BY_STORE_ITEM_EXPANDED,
    payload: {
        id,
        expanded
    }
})

const setByStoreAllItemsExpanded = (expanded: boolean) => ({
    type: SET_BY_STORE_ALL_ITEMS_EXPANDED,
    payload: {
        expanded
    }
})

const startByStoreItemNameEditing = (id: string) => ({
    type: START_BY_STORE_ITEM_NAME_EDITING,
    payload: {
        id
    }
})

const confirmByStoreItemNameEditing = (id: string) => ({
    type: CONFIRM_BY_STORE_ITEM_NAME_EDITING,
    payload: {
        id
    }
})

const cancelByStoreItemNameEditing = (id: string) => ({
    type: CANCEL_BY_STORE_ITEM_NAME_EDITING,
    payload: {
        id
    }
})

const setByStoreItemName = (id: string, name: string) => ({
    type: SET_BY_STORE_ITEM_NAME,
    payload: {
        id,
        name
    }
})

const setByStoreItemStared = (id: string, stared: boolean) => ({
    type: SET_BY_STORE_ITEM_STARED,
    payload: {
        id,
        stared
    }
})

const setByStoreStaredInventoryExpanded = (expanded: boolean) => ({
    type: SET_BY_STORE_STARED_EXPANDED,
    payload: {
        expanded
    }
})

const setByStoreStaredItemExpanded = (id: string) => (expanded: boolean) => ({
    type: SET_BY_STORE_STARED_ITEM_EXPANDED,
    payload: {
        id,
        expanded
    }
})

const setByStoreCraftItemExpanded = (id: string) => (expanded: boolean) => ({
    type: SET_BY_STORE_CRAFT_ITEM_EXPANDED,
    payload: {
        id,
        expanded
    }
})

const setByStoreStaredAllItemsExpanded = (expanded: boolean) => ({
    type: SET_BY_STORE_STARED_ALL_ITEMS_EXPANDED,
    payload: {
        expanded
    }
})

const startByStoreStaredItemNameEditing = (id: string) => ({
    type: START_BY_STORE_STARED_ITEM_NAME_EDITING,
    payload: {
        id
    }
})

const confirmByStoreStaredItemNameEditing = (id: string) => ({
    type: CONFIRM_BY_STORE_STARED_ITEM_NAME_EDITING,
    payload: {
        id
    }
})

const cancelByStoreStaredItemNameEditing = (id: string) => ({
    type: CANCEL_BY_STORE_STARED_ITEM_NAME_EDITING,
    payload: {
        id
    }
})

const setByStoreStaredItemName = (id: string, name: string) => ({
    type: SET_BY_STORE_STARED_ITEM_NAME,
    payload: {
        id,
        name
    }
})

const setByStoreStaredItemStared = (id: string, stared: boolean) => ({
    type: SET_BY_STORE_STARED_ITEM_STARED,
    payload: {
        id,
        stared
    }
})

const setByStoreCraftFilter = (filter: string) => ({
    type: SET_BY_STORE_CRAFT_FILTER,
    payload: {
        filter
    }
})

const setHiddenInventoryFilter = (filter: string) => ({
    type: SET_HIDDEN_FILTER,
    payload: {
        filter
    }
})

const setByStoreInventoryFilter = (filter: string) => ({
    type: SET_BY_STORE_FILTER,
    payload: {
        filter
    }
})

const setByStoreStaredInventoryFilter = (filter: string) => ({
    type: SET_BY_STORE_STARED_FILTER,
    payload: {
        filter
    }
})

const setOwnedBlueprintsExpanded = (expanded: boolean) => ({
    type: SET_BLUEPRINTS_EXPANDED,
    payload: {
        expanded
    }
})

const setOwnedBlueprintsFilter = (filter: string) => ({
    type: SET_BLUEPRINTS_FILTER,
    payload: {
        filter
    }
})

const sortOwnedBlueprintsBy = (part: number) => ({
    type: SORT_OWNED_BLUEPRINTS_BY,
    payload: {
        part
    }
})

const sortAuctionBy = (part: number) => ({
    type: SORT_AUCTION_BY,
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

const sortByStoreBy = (part: number) => ({
    type: SORT_BY_STORE_BY,
    payload: {
        part
    }
})

const sortByStoreStaredBy = (part: number) => ({
    type: SORT_BY_STORE_STARED_BY,
    payload: {
        part
    }
})

const sortByStoreCraftBy = (part: number) => ({
    type: SORT_BY_STORE_CRAFT_BY,
    payload: {
        part
    }
})

const sortAvailableBy = (part: number) => ({
    type: SORT_AVAILABLE_BY,
    payload: {
        part
    }
})

const hideByName = (name: string) => ({
    type: HIDE_BY_NAME,
    payload: {
        name
    }
})

const showByName = (name: string) => ({
    type: SHOW_BY_NAME,
    payload: {
        name
    }
})

const hideByContainer = (container: string) => ({
    type: HIDE_BY_CONTAINER,
    payload: {
        container
    }
})

const showByContainer = (container: string) => ({
    type: SHOW_BY_CONTAINER,
    payload: {
        container
    }
})

const hideByValue = (value: string) => ({
    type: HIDE_BY_VALUE,
    payload: {
        value
    }
})

const showByValue = (value: string) => ({
    type: SHOW_BY_VALUE,
    payload: {
        value
    }
})

const addAvailable = (name: string) => ({
    type: ADD_AVAILABLE,
    payload: {
        name
    }
})

const removeAvailable = (name: string) => ({
    type: REMOVE_AVAILABLE,
    payload: {
        name
    }
})

const showAll = () => ({
    type: SHOW_ALL
})

const showTradingItemData = (name: string) => ({
    type: SHOW_TRADING_ITEM_DATA,
    payload: {
        name
    }
})

const loadTradingItemData = (craftState: CraftState, usage: WebLoadResponse<ItemUsageWebData>) => ({
    type: LOAD_TRADING_ITEM_DATA,
    payload: {
        craftState,
        usage
    }
})

const sortTradeFavoriteBlueprintsBy = (part: number) => ({
    type: SORT_TRADE_FAVORITE_BLUEPRINTS_BY,
    payload: {
        part
    }
})

const sortTradeOwnedBlueprintsBy = (part: number) => ({
    type: SORT_TRADE_OWNED_BLUEPRINTS_BY,
    payload: {
        part
    }
})

const sortTradeOtherBlueprintsBy = (part: number) => ({
    type: SORT_TRADE_OTHER_BLUEPRINTS_BY,
    payload: {
        part
    }
})

export {
    LOAD_INVENTORY_STATE,
    SET_CURRENT_INVENTORY,
    SET_AUCTION_EXPANDED,
    SET_AVAILABLE_EXPANDED,
    SET_HIDDEN_EXPANDED,
    SET_HIDDEN_FILTER,
    SET_BLUEPRINTS_EXPANDED,
    SET_BLUEPRINTS_FILTER,
    SORT_OWNED_BLUEPRINTS_BY,
    SET_BY_STORE_EXPANDED,
    SET_BY_STORE_ITEM_EXPANDED,
    SET_BY_STORE_ALL_ITEMS_EXPANDED,
    SET_BY_STORE_FILTER,
    START_BY_STORE_ITEM_NAME_EDITING,
    CONFIRM_BY_STORE_ITEM_NAME_EDITING,
    CANCEL_BY_STORE_ITEM_NAME_EDITING,
    SET_BY_STORE_ITEM_NAME,
    SET_BY_STORE_ITEM_STARED,
    SET_BY_STORE_STARED_EXPANDED,
    SET_BY_STORE_STARED_ITEM_EXPANDED,
    SET_BY_STORE_CRAFT_ITEM_EXPANDED,
    SET_BY_STORE_STARED_ALL_ITEMS_EXPANDED,
    SET_BY_STORE_STARED_FILTER,
    START_BY_STORE_STARED_ITEM_NAME_EDITING,
    CONFIRM_BY_STORE_STARED_ITEM_NAME_EDITING,
    CANCEL_BY_STORE_STARED_ITEM_NAME_EDITING,
    SET_BY_STORE_STARED_ITEM_NAME,
    SET_BY_STORE_STARED_ITEM_STARED,
    SET_BY_STORE_CRAFT_FILTER,
    SORT_AUCTION_BY,
    SORT_HIDDEN_BY,
    SORT_BY_STORE_BY,
    SORT_BY_STORE_STARED_BY,
    SORT_BY_STORE_CRAFT_BY,
    SORT_AVAILABLE_BY,
    HIDE_BY_NAME,
    SHOW_BY_NAME,
    HIDE_BY_CONTAINER,
    SHOW_BY_CONTAINER,
    HIDE_BY_VALUE,
    SHOW_BY_VALUE,
    SHOW_ALL,
    SHOW_TRADING_ITEM_DATA,
    LOAD_TRADING_ITEM_DATA,
    SORT_TRADE_FAVORITE_BLUEPRINTS_BY,
    SORT_TRADE_OWNED_BLUEPRINTS_BY,
    SORT_TRADE_OTHER_BLUEPRINTS_BY,
    ADD_AVAILABLE,
    REMOVE_AVAILABLE,
    loadInventoryState,
    setCurrentInventory,
    setAuctionInventoryExpanded,
    setAvailableInventoryExpanded,
    setHiddenInventoryExpanded,
    setHiddenInventoryFilter,
    setOwnedBlueprintsExpanded,
    setOwnedBlueprintsFilter,
    sortOwnedBlueprintsBy,
    setByStoreInventoryExpanded,
    setByStoreItemExpanded,
    setByStoreCraftItemExpanded,
    setByStoreAllItemsExpanded,
    setByStoreInventoryFilter,
    startByStoreItemNameEditing,
    confirmByStoreItemNameEditing,
    cancelByStoreItemNameEditing,
    setByStoreItemName,
    setByStoreItemStared,
    setByStoreStaredInventoryExpanded,
    setByStoreStaredItemExpanded,
    setByStoreStaredAllItemsExpanded,
    setByStoreStaredInventoryFilter,
    startByStoreStaredItemNameEditing,
    confirmByStoreStaredItemNameEditing,
    cancelByStoreStaredItemNameEditing,
    setByStoreStaredItemName,
    setByStoreStaredItemStared,
    setByStoreCraftFilter,
    sortAuctionBy,
    sortHiddenBy,
    sortByStoreBy,
    sortByStoreStaredBy,
    sortByStoreCraftBy,
    sortAvailableBy,
    hideByName,
    showByName,
    hideByContainer,
    showByContainer,
    hideByValue,
    showByValue,
    showAll,
    showTradingItemData,
    loadTradingItemData,
    sortTradeFavoriteBlueprintsBy,
    sortTradeOwnedBlueprintsBy,
    sortTradeOtherBlueprintsBy,
    addAvailable,
    removeAvailable,
}