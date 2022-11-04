import { addUseToSheetDone, ADD_USE_TO_SHEET, USE_AMOUNT_CHANGED, setUseState } from "../actions/use"
import { addPendingChange } from "../actions/sheets"
import { PAGE_LOADED } from "../actions/ui"
import { useOperation, useSheetsMethod } from "../helpers/use"
import { getOneUse, getUse } from "../selectors/use"
import { UseOneState } from "../state/use"
import { CalculatorStateOut1 } from "../state/calculator"
import { getCalculatorOut, getCalculatorOutNB } from "../selectors/calculator"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state = await api.storage.loadUse()
            if (state)
                dispatch(setUseState(state))
            break
        }
        case USE_AMOUNT_CHANGED: {
            const state = getUse(getState())
            await api.storage.saveUse(state)
            break
        }
        case ADD_USE_TO_SHEET: {
            const m = action.payload.material
            const s: UseOneState = getOneUse(m)(getState())
            const s1: CalculatorStateOut1 = getCalculatorOut(m, getState())
            dispatch(addPendingChange(
                useOperation[m],
                sheet => sheet[useSheetsMethod[m]](s.amount, s1.cost),
                row => [ addUseToSheetDone(m) ]
            ))
            break
        }
    }
}

export default [
    requests
]
