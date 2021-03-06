import { addSale } from "../actions/actives"
import { DILUTED_CHANGED, lmeSellDone, LME_MARKUP_CHANGED, LME_SELL, LME_VALUE_CHANGED, meSellDone, ME_MARKUP_CHANGED, ME_SELL, ME_VALUE_CHANGED, NEXUS_CHANGED, setCalculatorState, SWEAT_CHANGED } from "../actions/calculator"
import { addPendingChange } from "../actions/sheets"
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
            const s: CalculatorStateOut1 = getCalculatorOutME(getState())
            dispatch(addPendingChange(
                OPERATION_ME_SELL,
                sheet => sheet.sellME(s.amount, s.openingFee, s.openingValue),
                row => [
                    addSale(row, OPERATION_ME_SOLD, 'Auction ME', s.amount, s.openingValue, s.buyoutValue, s.buyoutFee),
                    meSellDone
                ]
            ))
            break
        }
        case LME_SELL: {
            const s: CalculatorStateOut1 = getCalculatorOutLME(getState())
            dispatch(addPendingChange(
                OPERATION_LME_SELL,
                sheet => sheet.sellLME(s.amount, s.openingFee, s.openingValue),
                row => [
                    addSale(row, OPERATION_LME_SOLD, 'Auction LME', s.amount, s.openingValue, s.buyoutValue, s.buyoutFee),
                    lmeSellDone
                ]
            ))
            break
        }
    }
}

export default [
    requests
]
