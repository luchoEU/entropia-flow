import { trace, traceData } from "../../../common/trace"
import { ADD_SALE, endLoading, removeActive, REMOVE_ACTIVE, setActives, setLoadingError, setLoadingStage, SOLD_ACTIVE, startLoading } from "../actions/actives"
import { PAGE_LOADED } from "../actions/ui"
import { getActiveList } from "../selectors/actives"
import { ACTIVES_ITEM, OPERATION_LME_SOLD, OPERATION_ME_SOLD } from "../state/actives"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const actives = await api.storage.loadActives()
            if (actives)
                dispatch(setActives(actives))
            break
        }
        case ADD_SALE:
        case REMOVE_ACTIVE: {
            const list = getActiveList(getState())
            await api.storage.saveActives(list)
            break
        }
        case SOLD_ACTIVE: {
            const list = getActiveList(getState())
            const date = action.payload.date
            const item: ACTIVES_ITEM = list.find((a: ACTIVES_ITEM) => a.date == date)
            if (item !== undefined) {
                try {
                    dispatch(startLoading(item.operation))
                    const setStage = (stage: number) => dispatch(setLoadingStage(stage))
                    const sheet = await api.sheets.load(setStage)
                    const soldFunc = () => {
                        switch (item.operation) {
                            case OPERATION_ME_SOLD: return api.sheets.meSold
                            case OPERATION_LME_SOLD: return api.sheets.lmeSold
                        }
                    }
                    await soldFunc()(sheet, item.row, item.quantity, item.buyoutFee, item.buyout)
                    await api.sheets.save(sheet, setStage)
                    dispatch(removeActive(item.date))
                    dispatch(endLoading)
                } catch (e) {
                    dispatch(setLoadingError(e.message))
                    trace('exception calculator ME:')
                    traceData(e)
                }
                break
            }
        }
    }
}

export default [
    requests
]