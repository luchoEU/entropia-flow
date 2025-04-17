import { Inventory } from "../../../common/state"
import { InventoryState } from "../state/inventory"
import { LastRequiredState } from "../state/last"
import { ItemsMap } from "../state/items"

const SET_LAST_STATE = "[last] set state"
const ON_LAST = "[last] on last"
const SET_EXPANDED = "[last] set expanded"
const INCLUDE = "[last] include"
const EXCLUDE = "[last] exclude"
const EXCLUDE_WARNINGS = "[last] exclude warnings"
const PERMANENT_EXCLUDE = "[last] permanent exclude"
const SET_LAST_ITEM_MODE = "[last] set last item mode"
const SET_LAST_SHOW_MARKUP = "[last] set last show markup"
const SORT_BY = "[last] sort by"
const ADD_PEDS = "[last] add peds"
const REMOVE_PEDS = "[last] remove peds"
const ADD_ACTIONS = "[last] add actions"
const ADD_NOTIFICATIONS_DONE = "[last] add notifications done"
const APPLY_MARKUP_TO_LAST = "[last] apply markup"

const setLastState = (state: LastRequiredState) => ({
    type: SET_LAST_STATE,
    payload: {
        state
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

const setLastItemMode = (key: number, type: number, data: any) => ({
    type: SET_LAST_ITEM_MODE,
    payload: {
        key,
        mode: { type, data }
    }
})

const clearLastItemMode = (key: number) => ({
    type: SET_LAST_ITEM_MODE,
    payload: {
        key,
        mode: undefined
    }
})

const setLastShowMarkup = (showMarkup: boolean) => ({
    type: SET_LAST_SHOW_MARKUP,
    payload: {
        showMarkup
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

const addActionsToLast = (inventory: InventoryState) => ({
    type: ADD_ACTIONS,
    payload: {
        inventory
    }
})

const addNotificationsDone = (messages: string[]) => ({
    type: ADD_NOTIFICATIONS_DONE,
    payload: {
        messages
    }
})

const applyMarkupToLast = (items: ItemsMap) => ({
    type: APPLY_MARKUP_TO_LAST,
    payload: {
        items
    }
})

export {
    SET_LAST_STATE,
    ON_LAST,
    SET_EXPANDED,
    INCLUDE,
    EXCLUDE,
    EXCLUDE_WARNINGS,
    PERMANENT_EXCLUDE,
    SET_LAST_ITEM_MODE,
    SET_LAST_SHOW_MARKUP,
    SORT_BY,
    ADD_PEDS,
    REMOVE_PEDS,
    ADD_ACTIONS,
    ADD_NOTIFICATIONS_DONE,
    APPLY_MARKUP_TO_LAST,
    setLastState,
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
    setLastItemMode,
    setLastShowMarkup,
    clearLastItemMode,
    addActionsToLast,
    addNotificationsDone,
    applyMarkupToLast,
}
