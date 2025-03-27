import { Inventory } from "../../../common/state"

const SET_HISTORY_LIST = "[hist] set inventory list"
const SET_ITEM_EXPANDED = "[hist] set item expanded"
const SET_HISTORY_INTERVAL_ID = "[hist] set interval id"
const SORT_BY = "[hist] sort by"

const setHistoryList = (list: Array<Inventory>, last: number) => ({
    type: SET_HISTORY_LIST,
    payload: {
        list,
        last
    }
})

const setItemExpanded = (key: number) => (expanded: boolean) => ({
    type: SET_ITEM_EXPANDED,
    payload: {
        key,
        expanded
    }
})

const setHistoryIntervalId = (intervalId: NodeJS.Timer) => ({
    type: SET_HISTORY_INTERVAL_ID,
    payload: {
        intervalId
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
    SET_HISTORY_LIST,
    SET_ITEM_EXPANDED,
    SET_HISTORY_INTERVAL_ID,
    SORT_BY,
    setHistoryList,
    setItemExpanded,
    setHistoryIntervalId,
    sortBy
}
