import { STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages";
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
            itemName: name.split("Blueprint")[0].trim(),
            info: {
                loading: true,
                url: undefined,
                itemValue: undefined,
                materials: [],
            },
            budget: {
                loading: false,
                stage: STAGE_INITIALIZING
            }
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
                    loadingInfo: false,
                    url: data.Url,
                    itemValue: data.ItemValue,
                    materials: data.Material.map(m => ({
                        name: m.Name,
                        quantity: m.Quantity,
                        type: m.Type,
                        value: m.Value,
                    }))
                }
            } else {
                return {
                    ...bp,
                    loadingInfo: false,
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
        for (let m of bp.info.materials) {
            let available = dictionary[m.name] ?? 0
            materials.push({
                ...m,
                available,
                clicks: Math.floor(available / m.quantity)
            })
            clickCost += m.quantity * Number(m.value)
        }

        const residueNeeded = Number(bp.info.itemValue) - clickCost
        const residueMaterial = materials[materials.length - 1]
        residueMaterial.clicks = Math.floor((Number(residueMaterial.value) * residueMaterial.available) / residueNeeded)

        blueprints.push({
            ...bp,
            materials,
            itemAvailable: dictionary[bp.itemName] ?? 0,
            clickCost: clickCost.toFixed(2),
            residueNeeded: residueNeeded.toFixed(2)
        })
    }

    return { blueprints }
}

const startBudgetLoading = (state: CraftState, name: string): CraftState => ({
    blueprints: state.blueprints.map(bp => bp.name === name ? { ...bp, budget: { ...bp.budget, loading: true } } : bp)
})

const setBudgetState = (state: CraftState, name: string, stage: number): CraftState => state

const endBudgetLoading = (state: CraftState, name: string): CraftState => ({
    blueprints: state.blueprints.map(bp => bp.name === name ? { ...bp, budget: { ...bp.budget, loading: false } } : bp)
})

const errorBudgetLoading = (state: CraftState, name: string, text: string): CraftState => ({
    blueprints: state.blueprints.map(bp => bp.name === name ? { ...bp, budget: { ...bp.budget, error: text } } : bp)
})

export {
    initialState,
    setState,
    addBlueprint,
    removeBlueprint,
    addBlueprintData,
    setBlueprintQuantity,
    startBudgetLoading,
    setBudgetState,
    endBudgetLoading,
    errorBudgetLoading,
}
