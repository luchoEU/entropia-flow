import { CRAFT_PAGE, selectMenu, SELECT_FOR_ACTION } from "../actions/menu"
import { setBlueprintExpanded, setBlueprintStared } from "../actions/craft"
import { CraftState } from "../state/craft"
import { getCraft } from "../selectors/craft"
import { InventoryState } from "../state/inventory"
import { getInventory } from "../selectors/inventory"
import { bpNameFromItemName } from "../helpers/craft"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case SELECT_FOR_ACTION: {
            dispatch(selectMenu(action.payload.menu))

            if (action.payload.menu === CRAFT_PAGE) {
                const state: CraftState = getCraft(getState())
                const expBpName = state.blueprints.find(bp => bp.itemName === action.payload.name)?.name
                if (expBpName) {
                    dispatch(setBlueprintExpanded(expBpName)(true))
                } else {
                    const inv: InventoryState = getInventory(getState())
                    const addBpName = bpNameFromItemName(inv, action.payload.name)
                    if (addBpName)
                        dispatch(setBlueprintStared(addBpName, true))
                }
            }
            break
        }
    }
}

export default [
    requests
]