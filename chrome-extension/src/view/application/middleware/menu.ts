import { FruitStateIn } from "../state/fruit"
import { initialState } from "../helpers/fruit"
import { AUCTION_PAGE, CRAFT_PAGE, selectMenu, SELECT_FOR_ACTION } from "../actions/menu"
import { KIN_AMP_SOLD, LME_SOLD, ME_SOLD, NB_SOLD } from "../state/history"
import { addBlueprint, setBlueprintExpanded } from "../actions/craft"
import { CraftState } from "../state/craft"
import { getCraft } from "../selectors/craft"
import { InventoryState } from "../state/inventory"
import { getInventory } from "../selectors/inventory"
import { itemNameFromBpName } from "../helpers/craft"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case SELECT_FOR_ACTION: {
            switch (action.payload.action) {
                case ME_SOLD:
                case LME_SOLD:
                case NB_SOLD: {
                    dispatch(selectMenu(AUCTION_PAGE))
                    break
                }
                case KIN_AMP_SOLD: {
                    dispatch(selectMenu(CRAFT_PAGE))

                    const state: CraftState = getCraft(getState())
                    const expBpName = state.blueprints.find(bp => bp.itemName === action.payload.name)?.name
                    if (expBpName !== undefined) {
                        dispatch(setBlueprintExpanded(expBpName, true))
                    } else {
                        const inv: InventoryState = getInventory(getState())
                        const addBpName = inv.blueprints.items.find(bp => itemNameFromBpName(bp.n) == action.payload.name)?.n
                        if (addBpName !== undefined)
                            dispatch(addBlueprint(addBpName))
                    }
                    
                    break
                }
            }
            break
        }
    }
}

export default [
    requests
]