import { traceError } from "../../../common/trace"
import { endLoading, setLoadingError, setLoadingStage, startLoading } from "../actions/actives"
import { NEW_DAY } from "../actions/helpers"
import { getCalculatorOutME } from "../selectors/calculator"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case NEW_DAY: {
            try {
                const s = getCalculatorOutME(getState())
                dispatch(startLoading('Preparing New Day'))
                await api.sheets.newDay(
                    (stage: number) => dispatch(setLoadingStage(stage)))
                dispatch(endLoading)
                break
            } catch (e) {
                dispatch(setLoadingError(e.message))
                traceError('HelpersMiddleware', 'exception calculator ME:', e)
            }
        }
    }
}

export default [
    requests
]
