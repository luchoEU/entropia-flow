import { setFruitState, FRUIT_AMOUNT_CHANGED, FRUIT_PRICE_CHANGED } from "../actions/fruit"
import { AppAction } from "../slice/app"
import { getFruitIn } from "../selectors/fruit"
import { FruitStateIn } from "../state/fruit"
import { initialState } from "../helpers/fruit"
import { mergeDeep } from "../../../common/merge"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action: any) => {
    await next(action)
    switch (action.type) {
        case AppAction.INITIALIZE: {
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