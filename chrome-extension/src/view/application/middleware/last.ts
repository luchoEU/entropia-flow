import { ADD_PEDS, EXCLUDE, INCLUDE, ON_LAST, REMOVE_PEDS, setBlacklist, setPeds } from "../actions/last"
import { PAGE_LOADED } from "../actions/ui"
import { getBlacklist, getPeds } from "../selectors/last"
import { ViewPedData } from "../state/last"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            let list = await api.storage.loadBlacklist()
            if (list)
                dispatch(setBlacklist(list))
            let peds = await api.storage.loadPeds()
            if (peds)
                dispatch(setPeds(peds))
        }
        case INCLUDE:
        case EXCLUDE: {
            const state: Array<string> = getBlacklist(getState())
            await api.storage.saveBlacklist(state)
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