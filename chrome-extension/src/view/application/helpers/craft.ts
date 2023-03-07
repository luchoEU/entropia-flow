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
                        quantity: m.Quantity
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

export {
    initialState,
    addBlueprint,
    addBlueprintData,
}
