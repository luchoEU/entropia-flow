import { ADD_SALE, REMOVE_ACTIVE, setActives } from "../actions/actives"
import { PAGE_LOADED } from "../actions/ui"
import { getActiveList } from "../selectors/actives"
import { ActivesList } from "../state/actives"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const actives: ActivesList = await api.storage.loadActives()
            if (actives)
                dispatch(setActives(actives))
            break
        }
        case ADD_SALE:
        case REMOVE_ACTIVE: {
            const list: ActivesList = getActiveList(getState())
            await api.storage.saveActives(list)
            break
        }
    }
}

export default [
    requests
]
