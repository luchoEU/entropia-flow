import { setFruitState, FRUIT_AMOUNT_CHANGED, FRUIT_PRICE_CHANGED } from "../actions/fruit"
import { PAGE_LOADED } from "../actions/ui"
import { getFruitIn } from "../selectors/fruit"
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
    }
}

export default [
    requests
]