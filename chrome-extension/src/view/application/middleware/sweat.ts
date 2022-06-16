import { trace, traceData } from "../../../common/trace"
import { endLoading, setLoadingError, setLoadingStage, startLoading } from "../actions/actives"
import { ADD_SWEAT_TO_SHEET, setSweatState, SWEAT_AMOUNT_CHANGED, SWEAT_PRICE_CHANGED } from "../actions/sweat"
import { PAGE_LOADED } from "../actions/ui"
import { getSweatIn } from "../selectors/sweat"
import { OPERATION_ADD_SWEAT } from "../state/actives"
import { SweatStateIn } from "../state/sweat"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state = await api.storage.loadSweat()
            if (state)
                dispatch(setSweatState(state))
            break
        }
        case SWEAT_PRICE_CHANGED:
        case SWEAT_AMOUNT_CHANGED: {
            const state = getSweatIn(getState())
            await api.storage.saveSweat(state)
            break
        }
        case ADD_SWEAT_TO_SHEET: {
            try {
                const s: SweatStateIn = getSweatIn(getState())
                dispatch(startLoading(OPERATION_ADD_SWEAT))
                const setStage = (stage: number) => dispatch(setLoadingStage(stage))
                const sheet = await api.sheets.load(setStage)
                const row = await api.sheets.buySweat(sheet, s.price, s.amount)
                await api.sheets.save(sheet, setStage)
                dispatch(endLoading)
            } catch (e) {
                dispatch(setLoadingError(e.message))
                trace('exception order:')
                traceData(e)
            }
            break
        }
    }
}

export default [
    requests
]