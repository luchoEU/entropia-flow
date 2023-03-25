import { mergeDeep } from "../../../common/utils"
import { addSale } from "../actions/actives"
import { DILUTED_CHANGED, FRUIT_CHANGED, lmeSellDone, LME_MARKUP_CHANGED, LME_SELL, LME_VALUE_CHANGED, meSellDone, ME_MARKUP_CHANGED, ME_SELL, ME_VALUE_CHANGED, nbSellDone, NB_MARKUP_CHANGED, NB_SELL, NB_VALUE_CHANGED, NEXUS_CHANGED, setCalculatorState, SWEAT_CHANGED, SWEETSTUFF_CHANGED } from "../actions/calculator"
import { addPendingChange } from "../actions/sheets"
import { PAGE_LOADED } from "../actions/ui"
import { initialStateIn } from "../helpers/calculator"
import { getCalculatorIn, getCalculatorOutLME, getCalculatorOutME, getCalculatorOutNB } from "../selectors/calculator"
import { OPERATION_LME_SELL, OPERATION_LME_SOLD, OPERATION_ME_SELL, OPERATION_ME_SOLD, OPERATION_NB_SELL, OPERATION_NB_SOLD } from "../state/actives"
import { CalculatorStateIn, CalculatorStateOut1 } from "../state/calculator"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: CalculatorStateIn = await api.storage.loadCalculator()
            if (state)
                dispatch(setCalculatorState(mergeDeep(initialStateIn, state)))
            break
        }
        case SWEAT_CHANGED:
        case FRUIT_CHANGED:
        case NEXUS_CHANGED:
        case DILUTED_CHANGED:
        case SWEETSTUFF_CHANGED:
        case ME_MARKUP_CHANGED:
        case ME_VALUE_CHANGED:
        case LME_MARKUP_CHANGED:
        case LME_VALUE_CHANGED:
        case NB_MARKUP_CHANGED:
        case NB_VALUE_CHANGED: {
            const state: CalculatorStateIn = getCalculatorIn(getState())
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
        case NB_SELL: {
            const s: CalculatorStateOut1 = getCalculatorOutNB(getState())
            dispatch(addPendingChange(
                OPERATION_NB_SELL,
                sheet => sheet.sellNB(s.amount, s.openingFee, s.openingValue),
                row => [
                    addSale(row, OPERATION_NB_SOLD, 'Auction NB', s.amount, s.openingValue, s.buyoutValue, s.buyoutFee),
                    nbSellDone
                ]
            ))
            break
        }
    }
}

export default [
    requests
]
