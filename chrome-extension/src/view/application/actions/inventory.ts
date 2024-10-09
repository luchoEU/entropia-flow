import { Inventory } from "../../../common/state"
import { InventoryState } from "../state/inventory"

const LOAD_INVENTORY_STATE = "[inv] load state"
const SET_CURRENT_INVENTORY = "[inv] set current"
const SET_AUCTION_EXPANDED = "[inv] set auction expanded"
const SET_AVAILABLE_EXPANDED = "[inv] set available expanded"
const SET_TT_SERVICE_EXPANDED = "[inv] set tt service expanded"
const SET_VISIBLE_EXPANDED = "[inv] set visible expanded"
const SET_VISIBLE_FILTER = "[inv] set visible filter"
const SET_HIDDEN_EXPANDED = "[inv] set hidden expanded"
const SET_HIDDEN_FILTER = "[inv] set hidden filter"
const SET_BLUEPRINTS_EXPANDED = "[inv] set blueprints expanded"
const SET_BY_STORE_EXPANDED = "[inv] set by store expanded"
const SET_BY_STORE_ITEM_EXPANDED = "[inv] set by store item expanded"
const SET_BY_STORE_FILTER = "[inv] set by store filter"
const SORT_AUCTION_BY = "[inv] sort auction by"
const SORT_VISIBLE_BY = "[inv] sort visible by"
const SORT_HIDDEN_BY = "[inv] sort hidden by"
const SORT_AVAILABLE_BY = "[inv] sort available by"
const SORT_TT_SERVICE_BY = "[inv] sort tt service by"
const RELOAD_TT_SERVICE = "[inv] reload tt service"
const HIDE_BY_NAME = "[inv] hide by name"
const SHOW_BY_NAME = "[inv] show by name"
const HIDE_BY_CONTAINER = "[inv] hide by container"
const SHOW_BY_CONTAINER = "[inv] show by container"
const HIDE_BY_VALUE = "[inv] hide by value"
const SHOW_BY_VALUE = "[inv] show by value"
const SHOW_ALL = "[inv] show all"
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

const setTTServiceInventoryExpanded = (expanded: boolean) => ({
    type: SET_TT_SERVICE_EXPANDED,
    payload: {
        expanded
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

const setVisibleInventoryFilter = (filter: string) => ({
    type: SET_VISIBLE_FILTER,
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

const setOwnedBlueprintsExpanded = (expanded: boolean) => ({
    type: SET_BLUEPRINTS_EXPANDED,
    payload: {
        expanded
    }
})

const sortAuctionBy = (part: number) => ({
    type: SORT_AUCTION_BY,
    payload: {
        part
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

const sortAvailableBy = (part: number) => ({
    type: SORT_AVAILABLE_BY,
    payload: {
        part
    }
})

const sortTTServiceBy = (part: number) => ({
    type: SORT_TT_SERVICE_BY,
    payload: {
        part
    }
})

const reloadTTService = () => ({
    type: RELOAD_TT_SERVICE
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

export {
    LOAD_INVENTORY_STATE,
    SET_CURRENT_INVENTORY,
    SET_AUCTION_EXPANDED,
    SET_AVAILABLE_EXPANDED,
    SET_TT_SERVICE_EXPANDED,
    SET_VISIBLE_EXPANDED,
    SET_VISIBLE_FILTER,
    SET_HIDDEN_EXPANDED,
    SET_HIDDEN_FILTER,
    SET_BLUEPRINTS_EXPANDED,
    SET_BY_STORE_EXPANDED,
    SET_BY_STORE_ITEM_EXPANDED,
    SET_BY_STORE_FILTER,
    SORT_AUCTION_BY,
    SORT_VISIBLE_BY,
    SORT_HIDDEN_BY,
    SORT_AVAILABLE_BY,
    SORT_TT_SERVICE_BY,
    RELOAD_TT_SERVICE,
    HIDE_BY_NAME,
    SHOW_BY_NAME,
    HIDE_BY_CONTAINER,
    SHOW_BY_CONTAINER,
    HIDE_BY_VALUE,
    SHOW_BY_VALUE,
    SHOW_ALL,
    ADD_AVAILABLE,
    REMOVE_AVAILABLE,
    loadInventoryState,
    setCurrentInventory,
    setAuctionInventoryExpanded,
    setAvailableInventoryExpanded,
    setTTServiceInventoryExpanded,
    setVisibleInventoryExpanded,
    setVisibleInventoryFilter,
    setHiddenInventoryExpanded,
    setHiddenInventoryFilter,
    setOwnedBlueprintsExpanded,
    setByStoreInventoryExpanded,
    setByStoreItemExpanded,
    setByStoreInventoryFilter,
    sortAuctionBy,
    sortVisibleBy,
    sortHiddenBy,
    sortAvailableBy,
    sortTTServiceBy,
    reloadTTService,
    hideByName,
    showByName,
    hideByContainer,
    showByContainer,
    hideByValue,
    showByValue,
    showAll,
    addAvailable,
    removeAvailable,
}