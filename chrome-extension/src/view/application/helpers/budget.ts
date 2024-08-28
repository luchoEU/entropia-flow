import { objectMap } from "../../../common/utils"
import { STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages"
import { BudgetItem, BudgetMaterialsMap, BudgetState } from "../state/budget"

const initialState: BudgetState = {
    stage: STAGE_INITIALIZING,
    loadPercentage: 0,
    disabled: {
        expanded: false,
        names: []
    },
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
    disabled: {
        ...state.disabled,
        expanded
    }
})

const enableBudgetItem = (state: BudgetState, name: string) => ({
    ...state,
    disabled: {
        ...state.disabled,
        names: state.disabled.names.filter(n => n !== name)
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
            const filteredList = map[name].list.filter(m => m.itemName !== itemNameToRemove)
            if (filteredList.length > 0) {
                const newTotal = filteredList.reduce((sum, m) => sum + m.quantity, 0)
                updatedMap[name] = {
                    ...map[name],
                    list: filteredList,
                    total: newTotal
                }
            }
        }
    }

    return updatedMap;
}

const disableBudgetItem = (state: BudgetState, name: string) => ({
    ...state,
    disabled: {
        ...state.disabled,
        names: [ ...state.disabled.names, name ]
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
    disableBudgetItem
}
