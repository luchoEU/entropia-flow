import { ItemData } from "../../../common/state";
import { BluprintWebData, CraftState } from "../state/craft";

const initialState: CraftState = {
    blueprints: []
}

const addBlueprint = (state: CraftState, name: string): CraftState => ({
    blueprints: [
        ...state.blueprints,
        {
            name,
            loading: true,
            url: "",
            materials: [],
            error: ""
        }
    ]
})

const addBlueprintData = (state: CraftState, data: BluprintWebData): CraftState => ({
    blueprints: state.blueprints.map(bp => {
        if (bp.name === data.Name) {
            if (data.StatusCode === 0) {
               return {
                    ...bp,
                    loading: false,
                    url: data.Url,
                    materials: data.Material.map(m => ({
                        name: m.Name,
                        quantity: m.Quantity,
                        available: undefined
                    }))
                }
            } else {
                return {
                    ...bp,
                    loading: false,
                    error: `Loading Error, Code ${data.StatusCode}`
                }
            }
        } else {
            return bp
        }
    })
})

const setBlueprintQuantity = (state: CraftState, dictionary: { [k: string]: number }): CraftState => ({
    blueprints: state.blueprints.map(bp => ({
        ...bp,
        materials: bp.materials.map(m => ({
            ...m,
            available: dictionary[m.name] ?? 0
        }))
    }))
})

export {
    initialState,
    addBlueprint,
    addBlueprintData,
    setBlueprintQuantity,
}
