import { ItemData } from "../../../common/state"
import { addBlueprintData, ADD_BLUEPRINT, setBlueprintQuantity } from "../actions/craft"
import { joinDuplicates, joinList } from "../helpers/inventory"
import { getInventory } from "../selectors/inventory"

const requests = ({ api }) => ({ dispatch, getState }) => next => async (action) => {
    next(action)
    switch (action.type) {
        case ADD_BLUEPRINT: {
            let name = action.payload.name.replaceAll(' ','%20')
            let url = `https://apps5.genexus.com/entropia-flow-helper/rest/BlueprintInfo?name=${name}`
            let response = await fetch(url)
            let data = await response.json()
            dispatch(addBlueprintData(data))

            let s = getInventory(getState())
            let items = joinDuplicates(joinList(s))
            let dictionary: { [k: string]: number } = Object.fromEntries(items.map((x: ItemData) => [x.n, Number(x.q)]));
            dispatch(setBlueprintQuantity(dictionary))
            break
        }
    }
}

export default [
    requests
]