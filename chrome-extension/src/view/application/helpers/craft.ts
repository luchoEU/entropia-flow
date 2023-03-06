import { BluprintWebData, CraftState } from "../state/craft";

const initialState: CraftState = {
    blueprints: []
}

const addBlueprint = (state: CraftState, name: string): CraftState => ({
    blueprints: [
        ...state.blueprints,
        {
            name,
            materials: []
        }
    ]
})

const addBlueprintData = (state: CraftState, data: BluprintWebData): CraftState => ({
    blueprints: state.blueprints.map(bp => {
        if (bp.name === data.Name) {
            return {
                name: bp.name,
                materials: data.Material.map(m => ({
                    name: m.Name,
                    quantity: m.Quantity
                }))
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
