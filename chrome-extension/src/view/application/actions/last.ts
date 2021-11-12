import { Inventory } from "../../../common/state"
import { ViewPedData } from "../state/last"

const SET_BLACKLIST = "[last] set blacklist"
const SET_PEDS = "[last] set peds"
const ON_LAST = "[last] on last"
const SET_EXPANDED = "[last] set expanded"
const INCLUDE = "[last] include"
const EXCLUDE = "[last] exclude"
const EXCLUDE_WARNINGS = "[last] exclude warnings"
const SORT_BY = "[last] sort by"
const ADD_PEDS = "[last] add peds"
const REMOVE_PEDS = "[last] remove peds"

const setBlacklist = (list: Array<string>) => ({
    type: SET_BLACKLIST,
    payload: {
        list
    }
})

const setPeds = (peds: Array<ViewPedData>) => ({
    type: SET_PEDS,
    payload: {
        peds
    }
})

const onLast = (list: Array<Inventory>, last: number) => ({
    type: ON_LAST,
    payload: {
        list,
        last
    }
})

const setExpanded = (expanded: boolean) => ({
    type: SET_EXPANDED,
    payload: {
        expanded
    }
})

const include = (key: number) => ({
    type: INCLUDE,
    payload: {
        key
    }
})

const exclude = (key: number) => ({
    type: EXCLUDE,
    payload: {
        key
    }
})

const excludeWarnings = {
    type: EXCLUDE_WARNINGS
}

const sortBy = (part: number) => ({
    type: SORT_BY,
    payload: {
        part
    }
})

const addPeds = (value: string) => ({
    type: ADD_PEDS,
    payload: {
        value
    }
})

const removePeds = (key: number) => ({
    type: REMOVE_PEDS,
    payload: {
        key
    }
})

export {
    SET_BLACKLIST,
    SET_PEDS,
    ON_LAST,
    SET_EXPANDED,
    INCLUDE,
    EXCLUDE,
    EXCLUDE_WARNINGS,
    SORT_BY,
    ADD_PEDS,
    REMOVE_PEDS,
    setBlacklist,
    setPeds,
    onLast,
    setExpanded,
    include,
    exclude,
    excludeWarnings,
    sortBy,
    addPeds,
    removePeds
}