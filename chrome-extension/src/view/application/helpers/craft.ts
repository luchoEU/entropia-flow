import { BluprintWebData, CraftState } from "../state/craft";

const initialState: CraftState = {
    blueprints: []
}

const setState = (state: CraftState, inState: CraftState) => inState

const addBlueprint = (state: CraftState, name: string): CraftState => ({
    blueprints: [
        ...state.blueprints,
        {
            name,
            loading: true,
            url: undefined,
            itemValue: undefined,
            materials: [],
            error: undefined
        }
    ]
})

const removeBlueprint = (state: CraftState, name: string): CraftState => ({
    blueprints: state.blueprints.filter(bp => bp.name !== name)
})

const addBlueprintData = (state: CraftState, data: BluprintWebData): CraftState => ({
    blueprints: state.blueprints.map(bp => {
        if (bp.name === data.Name) {
            if (data.StatusCode === 0) {
               return {
                    ...bp,
                    loading: false,
                    url: data.Url,
                    itemValue: data.ItemValue,
                    materials: data.Material.map(m => ({
                        name: m.Name,
                        quantity: m.Quantity,
                        type: m.Type,
                        value: m.Value,
                        available: undefined,
                        clicks: undefined
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
            available: dictionary[m.name] ?? 0,
            clicks: Math.floor((dictionary[m.name] ?? 0) / m.quantity)
        }))
    }))
})

export {
    initialState,
    setState,
    addBlueprint,
    removeBlueprint,
    addBlueprintData,
    setBlueprintQuantity,
}
