import { BudgetSheetInfo } from "../../services/api/sheets/sheetsBudget";
import { STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages";
import { BlueprintData, BlueprintMaterial, BluprintWebData, CraftState } from "../state/craft";

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
                    info: {
                        loading: false,
                        url: data.Url,
                        itemValue: Number(data.ItemValue),
                        materials: data.Material.map(m => ({
                            name: m.Name,
                            quantity: m.Quantity,
                            type: m.Type,
                            value: Number(m.Value),
                        }))
                    }
                }
            } else {
                return {
                    ...bp,
                    info: {
                        ...bp.info,
                        loading: false,
                        error: `Loading Error, Code ${data.StatusCode}`
                    }
                }
            }
        } else {
            return bp
        }
    })
})

const setBlueprintQuantity = (state: CraftState, dictionary: { [k: string]: number }): CraftState => {
    let blueprints: BlueprintData[] = []    
    for (let bp of state.blueprints) {
        if (bp.info.loading) {
            blueprints.push(bp)
        } else {
            let clickTTCost = 0
            const materials: BlueprintMaterial[] = []
            for (const m of bp.info.materials) {
                const name = m.name === "Blueprint" ? bp.name : m.name
                const available = dictionary[name] ?? 0
                materials.push({
                    ...m,
                    available,
                    clicks: Math.floor(available / m.quantity)
                })
                clickTTCost += m.quantity * m.value
            }

            const residueNeeded = bp.info.itemValue - clickTTCost
            const residueMaterial = materials.find(m => m.type === "Residue")
            residueMaterial.clicks = Math.floor((residueMaterial.value * residueMaterial.available) / residueNeeded)

            const clicksAvailable = Math.min(...materials.map(m => m.clicks))

            blueprints.push({
                ...bp,
                info: {
                    ...bp.info,
                    materials,
                },
                inventory: {
                    itemAvailable: dictionary[bp.itemName] ?? 0,
                    clicksAvailable,
                    clickTTCost,
                    residueNeeded,
                }
            })
        }
    }

    return { blueprints }
}

const changeBudget = (state: CraftState, name: string, data: object) => ({
    blueprints: state.blueprints.map(bp => bp.name === name ? { ...bp, budget: { ...bp.budget, ...data } } : bp)
})

const startBudgetLoading = (state: CraftState, name: string): CraftState => 
    changeBudget(state, name, { loading: true } )

const setBudgetState = (state: CraftState, name: string, stage: number): CraftState =>
    changeBudget(state, name, { stage } )

const setBudgetInfo = (state: CraftState, name: string, info: BudgetSheetInfo): CraftState => {
    let blueprints: BlueprintData[] = []    
    for (let bp of state.blueprints) {
        let clickMUCost = 0
        const materials: BlueprintMaterial[] = []
        for (const m of bp.info.materials) {
            const materialInfo = info.materials[m.name]
            if (materialInfo === undefined) {
                materials.push(m)
            } else {
                materials.push({
                    ...m,
                    markup: materialInfo.markup,
                    budgetCount: materialInfo.current
                })
                clickMUCost += m.quantity * m.value * m.markup
            }
        }

        blueprints.push({
            ...bp,
            info: {
                ...bp.info,
                materials,
            },
            budget: {
                ...bp.budget,
                clickMUCost,
            }
        })
    }

    return { blueprints }
}

const endBudgetLoading = (state: CraftState, name: string): CraftState =>
    changeBudget(state, name, { loading: false } )

const errorBudgetLoading = (state: CraftState, name: string, text: string): CraftState => 
    changeBudget(state, name, { error: text } )

export {
    initialState,
    setState,
    addBlueprint,
    removeBlueprint,
    addBlueprintData,
    setBlueprintQuantity,
    startBudgetLoading,
    setBudgetState,
    setBudgetInfo,
    endBudgetLoading,
    errorBudgetLoading,
}
