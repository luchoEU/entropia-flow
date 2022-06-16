import { trace, traceData } from "../../../common/trace"
import { endLoading, setLoadingError, setLoadingStage, startLoading } from "../actions/actives"
import { ADD_PENDING_CHANGE } from "../actions/sheets"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case ADD_PENDING_CHANGE: {
            try {
                dispatch(startLoading(action.payload.operation))                
                const setStage = (stage: number) => dispatch(setLoadingStage(stage))
                const sheet = await api.sheets.load(setStage)
                const row = await action.payload.changeFunc(sheet)
                await api.sheets.save(sheet, setStage)
                for (const doneAction of action.payload.doneFunc(row))
                    dispatch(doneAction)
                dispatch(endLoading)
            } catch (e) {
                dispatch(setLoadingError(e.message))
                trace('exception changing sheet:')
                traceData(e)
            }
            break
        }
    }
}

export default [
    requests
]
