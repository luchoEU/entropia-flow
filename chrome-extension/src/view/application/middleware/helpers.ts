import { trace, traceData } from "../../../common/trace"
import { endLoading, setLoadingError, setLoadingStage, startLoading } from "../actions/actives"
import { NEW_DAY } from "../actions/helpers"
import { getCalculatorOutME } from "../selectors/calculator"
import { OperationText, OPERATION_NEW_DAY } from "../state/actives"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case NEW_DAY: {
            try {
                const s = getCalculatorOutME(getState())
                dispatch(startLoading(OperationText[OPERATION_NEW_DAY]))
                await api.sheets.newDay(
                    (stage: number) => dispatch(setLoadingStage(stage)))
                dispatch(endLoading)
                break
            } catch (e) {
                dispatch(setLoadingError(e.message))
                trace('exception calculator ME:')
                traceData(e)
            }
        }
    }
}

export default [
    requests
]
