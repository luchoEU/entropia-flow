import { objectMap } from "../../../common/utils"
import { STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages"
import { BudgetItem, BudgetMaterialsMap, BudgetState } from "../state/budget"

const initialState: BudgetState = {
    stage: STAGE_INITIALIZING,
    loadPercentage: 0,
    disabledItems: {
        expanded: false,
        names: []
    },
    disabledMaterials: { },
    materials: {
        expanded: false,
        map: { }
    },
    list: {
        expanded: true,
        items: []
    }
}

const setState = (state: BudgetState, inState: BudgetState): BudgetState => inState

const setBudgetFromSheet = (state: BudgetState, map: BudgetMaterialsMap, items: BudgetItem[], loadPercentage: number): BudgetState => ({
    ...state,
    loadPercentage,
    materials: {
        ...state.materials,
        map: objectMap(map, (v, k) => ({
            ...v,
            expanded: state.materials.map[k]?.expanded ?? false
        }))
    },
    list: {
        ...state.list,
        items
    }
})

const cleanForSave = (state: BudgetState): BudgetState => {
    const cState: BudgetState = JSON.parse(JSON.stringify(state))
    cState.stage = STAGE_INITIALIZING
    return cState
}

const setBudgetMaterialListExpanded = (state: BudgetState, expanded: boolean) => ({
    ...state,
    materials: {
        ...state.materials,
        expanded
    }
})

const setBudgetMaterialExpanded = (state: BudgetState, material: string, expanded: boolean): BudgetState => {
    const cState: BudgetState = JSON.parse(JSON.stringify(state))
    cState.materials.map[material].expanded = expanded
    return cState
}

const setBudgetStage = (state: BudgetState, stage: number) => ({
    ...state,
    stage
})

const setBudgetListExpanded = (state: BudgetState, expanded: boolean) => ({
    ...state,
    list: {
        ...state.list,
        expanded
    }
})

const setBudgetDisabledExpanded = (state: BudgetState, expanded: boolean) => ({
    ...state,
    disabledItems: {
        ...state.disabledItems,
        expanded
    }
})

const enableBudgetItem = (state: BudgetState, name: string) => ({
    ...state,
    disabledItems: {
        ...state.disabledItems,
        names: state.disabledItems.names.filter(n => n !== name)
    },
    list: {
        ...state.list,
        items: [
            ...state.list.items,
            {
                name,
                totalMU: 0,
                total: 0,
                peds: 0
            }
        ]
    }
})

function removeMaterialsByItemName(
    map: BudgetMaterialsMap,
    itemNameToRemove: string
): BudgetMaterialsMap {
    const updatedMap: BudgetMaterialsMap = {}

    for (const name in map) {
        if (map.hasOwnProperty(name)) {
            const filteredList = map[name].budgetList.filter(m => m.itemName !== itemNameToRemove)
            if (filteredList.length > 0) {
                const newTotal = filteredList.reduce((sum, m) => sum + m.quantity, 0)
                const newValue = filteredList.reduce((sum, m) => sum + m.value, 0) +
                    map[name].realList.reduce((sum, m) => sum + m.value, 0)
                updatedMap[name] = {
                    ...map[name],
                    budgetList: filteredList,
                    totalListQuantity: newTotal,
                    quantityBalance: newTotal + map[name].realList.reduce((sum, m) => sum + m.quantity, 0),
                    valueBalance: newValue
                }
            }
        }
    }

    return updatedMap
}

const disableBudgetItem = (state: BudgetState, name: string) => ({
    ...state,
    disabledItems: {
        ...state.disabledItems,
        names: [ ...state.disabledItems.names, name ]
    },
    list: {
        ...state.list,
        items: state.list.items.filter(i => i.name !== name)
    },
    materials: {
        ...state.materials,
        map: removeMaterialsByItemName(state.materials.map, name)
    }
})

const disableBudgetMaterial = (state: BudgetState, itemName: string, materialName: string) => ({
    ...state,
    disabledMaterials: {
        ...state.disabledMaterials,
        [itemName]: [...(state.disabledMaterials[itemName] || []), materialName]
    },
    materials: {
        ...state.materials,
        map: {
            ...state.materials.map,
            [itemName]: {
                ...state.materials.map[itemName],
                realList: state.materials.map[itemName].realList.map(material => 
                    material.itemName === materialName ? { ...material, disabled: true } : material
                ),
                quantityBalance: state.materials.map[itemName].quantityBalance -
                    (state.materials.map[itemName].realList.find(m => m.itemName === materialName)?.quantity || 0),
                valueBalance: state.materials.map[itemName].valueBalance -
                    (state.materials.map[itemName].realList.find(m => m.itemName === materialName)?.value || 0)
            }
        }
    }
})

const enableBudgetMaterial = (state: BudgetState, itemName: string, materialName: string) => {
    const updatedDisabledMaterials = {
        ...state.disabledMaterials,
        [itemName]: (state.disabledMaterials[itemName] || []).filter(name => name !== materialName)
    };

    // Remove the entry if the list is empty
    if (updatedDisabledMaterials[itemName].length === 0) {
        delete updatedDisabledMaterials[itemName];
    }

    return {
        ...state,
        disabledMaterials: updatedDisabledMaterials,
        materials: {
            ...state.materials,
            map: {
                ...state.materials.map,
                [itemName]: {
                    ...state.materials.map[itemName],
                    realList: state.materials.map[itemName].realList.map(material => 
                        material.itemName === materialName ? { ...material, disabled: false } : material
                    ),
                    quantityBalance: state.materials.map[itemName].quantityBalance +
                        (state.materials.map[itemName].realList.find(m => m.itemName === materialName)?.quantity || 0),
                    valueBalance: state.materials.map[itemName].valueBalance +
                        (state.materials.map[itemName].realList.find(m => m.itemName === materialName)?.value || 0)
                }
            }
        }
    };
};



export {
    initialState,
    setBudgetFromSheet,
    setState,
    cleanForSave,
    setBudgetMaterialListExpanded,
    setBudgetMaterialExpanded,
    setBudgetStage,
    setBudgetListExpanded,
    setBudgetDisabledExpanded,
    enableBudgetItem,
    disableBudgetItem,
    enableBudgetMaterial,
    disableBudgetMaterial
}
