import { mergeDeep } from "../../../common/merge"
import { setSweatState, SWEAT_AMOUNT_CHANGED, SWEAT_PRICE_CHANGED } from "../actions/sweat"
import { initialStateIn } from "../helpers/sweat"
import { getSweatIn } from "../selectors/sweat"
import { AppAction } from "../slice/app"
import { SweatStateIn } from "../state/sweat"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
            const state: SweatStateIn = await api.storage.loadSweat()
            if (state)
                dispatch(setSweatState(mergeDeep(initialStateIn, state)))
            break
        }
        case SWEAT_PRICE_CHANGED:
        case SWEAT_AMOUNT_CHANGED: {
            const state: SweatStateIn = getSweatIn(getState())
            await api.storage.saveSweat(state)
            break
        }
    }
}

export default [
    requests
]
