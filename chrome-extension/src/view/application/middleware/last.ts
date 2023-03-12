import { ADD_PEDS, PERMANENT_EXCLUDE, EXCLUDE, INCLUDE, ON_LAST, REMOVE_PEDS, setPermanentBlacklist, setBlacklist, setPeds } from "../actions/last"
import { PAGE_LOADED } from "../actions/ui"
import { getPermanentBlacklist, getBlacklist, getPeds } from "../selectors/last"
import { ViewPedData } from "../state/last"

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
            break
        }
    }
}

export default [
    requests
]