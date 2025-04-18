import { ADD_ACTIVE, REMOVE_ACTIVE, setActives } from "../actions/actives"
import { AppAction } from "../slice/app"
import { getActiveList } from "../selectors/actives"
import { ActivesList } from "../state/actives"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            const actives: ActivesList = await api.storage.loadActives()
            if (actives)
                dispatch(setActives(actives))
            break
        }
        case ADD_ACTIVE:
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
