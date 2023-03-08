import { ItemData } from "../../../common/state"
import { addBlueprintData, ADD_BLUEPRINT, ADD_BLUEPRINT_DATA, REMOVE_BLUEPRINT, setBlueprintQuantity, setCraftState, SET_BLUEPRINT_QUANTITY } from "../actions/craft"
import { SET_CURRENT_INVENTORY } from "../actions/inventory"
import { PAGE_LOADED } from "../actions/ui"
import { joinDuplicates, joinList } from "../helpers/inventory"
import { getCraft } from "../selectors/craft"
import { getInventory } from "../selectors/inventory"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case PAGE_LOADED: {
            const state = await api.storage.loadCraft()
            if (state)
                dispatch(setCraftState(state))
            break
        }
        case ADD_BLUEPRINT:
        case REMOVE_BLUEPRINT:
        case ADD_BLUEPRINT_DATA:
        case SET_BLUEPRINT_QUANTITY: {
            const state = getCraft(getState())
            await api.storage.saveCraft(state)
        }
    }
    if (action.type === ADD_BLUEPRINT) {
            let name = action.payload.name.replaceAll(' ','%20')
            let url = `https://apps5.genexus.com/entropia-flow-helper/rest/BlueprintInfo?name=${name}`
            let response = await fetch(url)
            let data = await response.json()
            dispatch(addBlueprintData(data))
    }
    if (action.type === ADD_BLUEPRINT || action.type === SET_CURRENT_INVENTORY) {
        let s = getInventory(getState())
        let items = joinDuplicates(joinList(s))
        let dictionary: { [k: string]: number } = Object.fromEntries(items.map((x: ItemData) => [x.n, Number(x.q)]));
        dispatch(setBlueprintQuantity(dictionary))
    }
}

export default [
    requests
]