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
            itemName: name.split("Blueprint")[0].trim(),
            itemValue: undefined,
            itemAvailable: undefined,
            materials: [],
            error: undefined,
            clickCost: undefined
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

const setBlueprintQuantity = (state: CraftState, dictionary: { [k: string]: number }): CraftState => {
    let blueprints = []    
    for (let bp of state.blueprints) {

        let clickCost = 0
        let materials = []
        for (let m of bp.materials) {
            let available = dictionary[m.name] ?? 0
            materials.push({
                ...m,
                available,
                clicks: Math.floor(available / m.quantity)
            })
            clickCost += m.quantity * Number(m.value)
        }

        blueprints.push({
            ...bp,
            itemAvailable: dictionary[bp.itemName] ?? 0,
            materials,
            clickCost: clickCost.toFixed(2)
        })
    }

    return { blueprints }
}

export {
    initialState,
    setState,
    addBlueprint,
    removeBlueprint,
    addBlueprintData,
    setBlueprintQuantity,
}
