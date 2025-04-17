import { mergeDeep } from "../../../common/merge"
import { ADD_PEDS, PERMANENT_EXCLUDE, EXCLUDE, INCLUDE, ON_LAST, REMOVE_PEDS, addActionsToLast, ADD_ACTIONS, addNotificationsDone, SET_LAST_SHOW_MARKUP, setLastState, SORT_BY, SET_EXPANDED, applyMarkupToLast, EXCLUDE_WARNINGS, ADD_NOTIFICATIONS_DONE } from "../actions/last"
import { ITEM_BUY_MARKUP_CHANGED, SET_ITEM_MARKUP_UNIT, SET_ITEMS_STATE } from "../actions/items"
import { SET_AS_LAST, SET_LAST } from "../actions/messages"
import { PAGE_LOADED } from "../actions/ui"
import { initialState } from "../helpers/last"
import { getInventory } from "../selectors/inventory"
import { getLast } from "../selectors/last"
import { getItemsMap } from "../selectors/items"
import { InventoryState } from "../state/inventory"
import { LastRequiredState } from "../state/last"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            let state: LastRequiredState = await api.storage.loadLast()
            if (state)
                dispatch(setLastState(mergeDeep(initialState, state)));
            break
        }
        case INCLUDE:
        case EXCLUDE:
        case PERMANENT_EXCLUDE:
        case ADD_PEDS:
        case REMOVE_PEDS:
        case SET_LAST:
        case SET_AS_LAST:
        case SORT_BY:
        case SET_EXPANDED:
        case ADD_NOTIFICATIONS_DONE:
        case SET_LAST_SHOW_MARKUP: {
            const state: LastRequiredState = getLast(getState())
            await api.storage.saveLast(state)
            break
        }
        case ON_LAST: {
            const inventory: InventoryState = getInventory(getState())
            dispatch(addActionsToLast(inventory))
        }
        case ADD_ACTIONS: {
            const state: LastRequiredState = getLast(getState())
            if (state.c.diff !== null) {
                const reduced = state.c.diff.reduce((list, d) => d.a === undefined ? list : [ ...list, d.a.message ], [])

                state.notificationsDone.forEach(m => {
                    const index = reduced.indexOf(m);
                    if (index > -1) {
                        reduced.splice(index, 1);
                    }
                })

                if (reduced.length > 0) {
                    chrome.notifications.create(
                        undefined,
                        { type: "basic", iconUrl: "img/flow128.png", title: "Entropia Flow", message: reduced.join('\n') }
                    )
                    dispatch(addNotificationsDone(reduced))
                }
            }
            break
        }
    }

    switch (action.type) {
        case SET_LAST_SHOW_MARKUP:
        case ON_LAST:
        case INCLUDE:
        case EXCLUDE:
        case EXCLUDE_WARNINGS:
        case SET_ITEMS_STATE:
        case ITEM_BUY_MARKUP_CHANGED:
        case SET_ITEM_MARKUP_UNIT: {
            const { showMarkup }: LastRequiredState = getLast(getState())
            if (showMarkup) {
                const items = getItemsMap(getState())
                dispatch(applyMarkupToLast(items))
            } else if (action.type === SET_LAST_SHOW_MARKUP) {
                dispatch(applyMarkupToLast({}))
            }
            break
        }
    }
}

export default [
    requests
]
