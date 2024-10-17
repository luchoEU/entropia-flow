import { mergeDeep } from "../../../common/merge"
import { DILUTED_CHANGED, FRUIT_CHANGED, LME_MARKUP_CHANGED, LME_VALUE_CHANGED, ME_MARKUP_CHANGED, ME_VALUE_CHANGED, NB_MARKUP_CHANGED, NB_VALUE_CHANGED, NEXUS_CHANGED, setCalculatorState, SWEAT_CHANGED, SWEETSTUFF_CHANGED } from "../actions/calculator"
import { PAGE_LOADED } from "../actions/ui"
import { initialStateIn } from "../helpers/calculator"
import { getCalculatorIn } from "../selectors/calculator"
import { CalculatorStateIn } from "../state/calculator"

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
    }
}

export default [
    requests
]
