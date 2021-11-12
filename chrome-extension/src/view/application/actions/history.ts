import { Inventory } from "../../../common/state"

const SET_INVENTORY_LIST = "[hist] set inventory list"
const SET_LIST_EXPANDED = "[hist] set list expanded"
const SET_ITEM_EXPANDED = "[hist] set item expanded"
const SORT_BY = "[hist] sort by"

const setInventoryList = (list: Array<Inventory>, last: number) => ({
    type: SET_INVENTORY_LIST,
    payload: {
        list,
        last
    }
})

const setListExpanded = (expanded: boolean) => ({
    type: SET_LIST_EXPANDED,
    payload: {
        expanded
    }
})

const setItemExpanded = (key: number, expanded: boolean) => ({
    type: SET_ITEM_EXPANDED,
    payload: {
        key,
        expanded
    }
})

const sortBy = (key: number, part: number) => ({
    type: SORT_BY,
    payload: {
        key,
        part
    }
})

export {
    SET_INVENTORY_LIST,
    SET_LIST_EXPANDED,
    SET_ITEM_EXPANDED,
    SORT_BY,
    setInventoryList,
    setListExpanded,
    setItemExpanded,
    sortBy
}