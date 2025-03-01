import { Inventory } from "../../../common/state"
import { AvailableCriteria } from "../state/inventory"
import { ViewPedData } from "../state/last"

const SET_BLACKLIST = "[last] set blacklist"
const SET_PERMANENT_BLACKLIST = "[last] set permanent blacklist"
const SET_PEDS = "[last] set peds"
const ON_LAST = "[last] on last"
const SET_EXPANDED = "[last] set expanded"
const INCLUDE = "[last] include"
const EXCLUDE = "[last] exclude"
const EXCLUDE_WARNINGS = "[last] exclude warnings"
const PERMANENT_EXCLUDE = "[last] permanent exclude"
const SORT_BY = "[last] sort by"
const ADD_PEDS = "[last] add peds"
const REMOVE_PEDS = "[last] remove peds"
const ADD_ACTIONS = "[last] add actions"
const ADD_NOTIFICATIONS_DONE = "[last] add notifications done"

const setBlacklist = (list: Array<string>) => ({
    type: SET_BLACKLIST,
    payload: {
        list
    }
})

const setPermanentBlacklist = (list: Array<string>) => ({
    type: SET_PERMANENT_BLACKLIST,
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

const permanentExcludeOn = (key: number) => ({
    type: PERMANENT_EXCLUDE,
    payload: {
        key,
        value: true
    }
})

const permanentExcludeOff = (key: number) => ({
    type: PERMANENT_EXCLUDE,
    payload: {
        key,
        value: false
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

const addActionsToLast = (availableCriteria: AvailableCriteria) => ({
    type: ADD_ACTIONS,
    payload: {
        availableCriteria
    }
})

const addNotificationsDone = (messages: string[]) => ({
    type: ADD_NOTIFICATIONS_DONE,
    payload: {
        messages
    }
})

export {
    SET_BLACKLIST,
    SET_PERMANENT_BLACKLIST,
    SET_PEDS,
    ON_LAST,
    SET_EXPANDED,
    INCLUDE,
    EXCLUDE,
    EXCLUDE_WARNINGS,
    PERMANENT_EXCLUDE,
    SORT_BY,
    ADD_PEDS,
    REMOVE_PEDS,
    ADD_ACTIONS,
    ADD_NOTIFICATIONS_DONE,
    setBlacklist,
    setPermanentBlacklist,
    setPeds,
    onLast,
    setExpanded,
    include,
    exclude,
    excludeWarnings,
    sortBy,
    addPeds,
    removePeds,
    permanentExcludeOn,
    permanentExcludeOff,
    addActionsToLast,
    addNotificationsDone,
}
