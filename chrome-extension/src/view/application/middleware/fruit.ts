import { addPendingChange } from "../actions/sheets"
import { addFruitToSheetDone, ADD_FRUIT_TO_SHEET, setFruitState, FRUIT_AMOUNT_CHANGED, FRUIT_PRICE_CHANGED } from "../actions/fruit"
import { PAGE_LOADED } from "../actions/ui"
import { getFruitIn } from "../selectors/fruit"
import { OPERATION_ADD_FRUIT } from "../state/actives"
import { FruitStateIn } from "../state/fruit"
import { initialState } from "../helpers/fruit"
import { mergeDeep } from "../../../common/utils"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state: FruitStateIn = await api.storage.loadFruit()
            if (state)
                dispatch(setFruitState(mergeDeep(initialState, state)))
            break
        }
        case FRUIT_PRICE_CHANGED:
        case FRUIT_AMOUNT_CHANGED: {
            const state: FruitStateIn = getFruitIn(getState())
            await api.storage.saveFruit(state)
            break
        }
        case ADD_FRUIT_TO_SHEET: {
            const s: FruitStateIn = getFruitIn(getState())
            dispatch(addPendingChange(
                OPERATION_ADD_FRUIT,
                sheet => sheet.buyFruit(s.price, s.amount),
                row => [ addFruitToSheetDone ]
            ))
            break
        }
    }
}

export default [
    requests
]