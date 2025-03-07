import { ADD_PEDS, PERMANENT_EXCLUDE, EXCLUDE, INCLUDE, ON_LAST, REMOVE_PEDS, setPermanentBlacklist, setBlacklist, setPeds, addActionsToLast, ADD_ACTIONS, addNotificationsDone } from "../actions/last"
import { PAGE_LOADED } from "../actions/ui"
import { getInventory } from "../selectors/inventory"
import { getPermanentBlacklist, getBlacklist, getPeds, getLast } from "../selectors/last"
import { InventoryState } from "../state/inventory"
import { LastRequiredState, ViewPedData } from "../state/last"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            let list: Array<string> = await api.storage.loadBlacklist()
            if (list)
                dispatch(setBlacklist(list))
            let aList: Array<string> = await api.storage.loadPermanentBlacklist()
            if (aList)
                dispatch(setPermanentBlacklist(aList))
            let peds: Array<ViewPedData> = await api.storage.loadPeds()
            if (peds)
                dispatch(setPeds(peds))
        }
        case INCLUDE:
        case EXCLUDE: {
            const state: Array<string> = getBlacklist(getState())
            await api.storage.saveBlacklist(state)
            break
        }
        case PERMANENT_EXCLUDE: {
            const state: Array<string> = getPermanentBlacklist(getState())
            await api.storage.savePermanentBlacklist(state)
            break
        }
        case ADD_PEDS:
        case REMOVE_PEDS:
        case ON_LAST: {
            const state: Array<ViewPedData> = getPeds(getState())
            await api.storage.savePeds(state)

            if (action.type === ON_LAST) {
                const inv: InventoryState = getInventory(getState())
                dispatch(addActionsToLast(inv.availableCriteria))
            }
            break
        }
        case ADD_ACTIONS: {
            const state: LastRequiredState = getLast(getState())
            if (state.diff !== null) {
                const reduced = state.diff.reduce((list, d) => d.a === undefined ? list : [ ...list, d.a.message ], [])

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
}

export default [
    requests
]
