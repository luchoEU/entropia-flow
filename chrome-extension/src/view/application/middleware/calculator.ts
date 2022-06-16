import { trace, traceData } from "../../../common/trace"
import { addSale, endLoading, setLoadingError, setLoadingStage, startLoading } from "../actions/actives"
import { DILUTED_CHANGED, LME_MARKUP_CHANGED, LME_SELL, LME_VALUE_CHANGED, ME_MARKUP_CHANGED, ME_SELL, ME_VALUE_CHANGED, NEXUS_CHANGED, setCalculatorState, SWEAT_CHANGED } from "../actions/calculator"
import { PAGE_LOADED } from "../actions/ui"
import { getCalculatorIn, getCalculatorOutLME, getCalculatorOutME } from "../selectors/calculator"
import { OPERATION_LME_SELL, OPERATION_LME_SOLD, OPERATION_ME_SELL, OPERATION_ME_SOLD } from "../state/actives"
import { CalculatorStateOut1 } from "../state/calculator"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state = await api.storage.loadCalculator()
            if (state)
                dispatch(setCalculatorState(state))
            break
        }
        case SWEAT_CHANGED:
        case NEXUS_CHANGED:
        case DILUTED_CHANGED:
        case ME_MARKUP_CHANGED:
        case ME_VALUE_CHANGED:
        case LME_MARKUP_CHANGED:
        case LME_VALUE_CHANGED: {
            const state = getCalculatorIn(getState())
            await api.storage.saveCalculator(state)
            break
        }
        case ME_SELL: {
            try {
                const s: CalculatorStateOut1 = getCalculatorOutME(getState())
                dispatch(startLoading(OPERATION_ME_SELL))
                const setStage = (stage: number) => dispatch(setLoadingStage(stage))
                const sheet = await api.sheets.load(setStage)
                const row = await api.sheets.sellME(sheet, s.amount, s.openingFee, s.openingValue)
                await api.sheets.save(sheet, setStage)
                dispatch(addSale(row, OPERATION_ME_SOLD, 'Auction ME', s.amount, s.openingValue, s.buyoutValue, s.buyoutFee))
                dispatch(endLoading)
            } catch (e) {
                dispatch(setLoadingError(e.message))
                trace('exception calculator ME:')
                traceData(e)
            }
            break
        }
        case LME_SELL: {
            try {
                const s: CalculatorStateOut1 = getCalculatorOutLME(getState())
                dispatch(startLoading(OPERATION_LME_SELL))
                const setStage = (stage: number) => dispatch(setLoadingStage(stage))
                const sheet = await api.sheets.load(setStage)
                const row = await api.sheets.sellLME(sheet, s.amount, s.openingFee, s.openingValue)
                await api.sheets.save(sheet, setStage)
                dispatch(addSale(row, OPERATION_LME_SOLD, 'Auction LME', s.amount, s.openingValue, s.buyoutValue, s.buyoutFee))
                dispatch(endLoading)
            } catch (e) {
                dispatch(setLoadingError(e.message))
                trace('exception calculator LME:')
                traceData(e)
            }
            break
        }
    }
}

export default [
    requests
]