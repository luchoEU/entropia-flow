import { mergeDeep } from "../../../common/utils"
import { addPendingChange } from "../actions/sheets"
import { setSweatState, SWEAT_AMOUNT_CHANGED, SWEAT_PRICE_CHANGED } from "../actions/sweat"
import { PAGE_LOADED } from "../actions/ui"
import { initialStateIn } from "../helpers/sweat"
import { getSweatIn } from "../selectors/sweat"
import { SweatStateIn } from "../state/sweat"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
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
