import { objectMap } from "../../../common/object"
import { ItemData } from "../../../common/state"
import { STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages"
import { BudgetLineData } from "../../services/api/sheets/sheetsBudget"
import { BudgetDisabledMaterials, BudgetGroup, BudgetItem, BudgetMaterial, BudgetMaterialsMap, BudgetMaterialState, BudgetState } from "../state/budget"
import { calculateMaterialDetails } from "./budgetViewData"

interface BalanceMaterialData {
  name: string;
  balanceQuantity: number;
  balanceWithMarkup: number;
  budget: Record<string, number>;
}

const initialState: BudgetState = {
    stage: STAGE_INITIALIZING,
    loadPercentage: 0,
    disabledItems: {
        names: []
    },
    disabledMaterials: { },
    materials: { },
    list: {
        items: []
    },
    groups: {
        list: [],
        ungroupedExpanded: true
    }
}

const setState = (state: BudgetState, inState: BudgetState): BudgetState => inState

export function getRealList(
    materialName: string,
    inventory: Array<ItemData>,
    disabledMaterials: BudgetDisabledMaterials
): BudgetMaterial[] {
    return inventory
        .filter(item => item.n === materialName)
        .map(item => ({
            itemName: item.c,
            disabled: disabledMaterials[materialName]?.includes(item.c) || false,
            quantity: Number(item.q)
        }))
}

const SHOW_WARNING_THRESHOLD_PED_WITH_MARKUP = 50

const reduceSetBudgetFromSheet = (state: BudgetState, map: BudgetMaterialsMap, items: BudgetItem[], loadPercentage: number): BudgetState => {
    const mapc: BudgetMaterialsMap = objectMap(map, (v: BudgetMaterialState, k: string) => ({
        ...v,
        expanded: state.materials[k]?.expanded ?? false
    }))
    return {
        ...state,
        loadPercentage,
        materials: mapc,
        list: {
            ...state.list,
            items
        }
    }
}

const cleanForSave = (state: BudgetState): BudgetState => ({
    ...state,
    stage: STAGE_INITIALIZING
})

const setBudgetMaterialExpanded = (state: BudgetState, material: string, expanded: boolean): BudgetState => {
    const cState: BudgetState = JSON.parse(JSON.stringify(state))
    cState.materials[material].expanded = expanded
    return cState
}

const setBudgetStage = (state: BudgetState, stage: number): BudgetState => ({
    ...state,
    stage,
    loadPercentage: stage === STAGE_INITIALIZING ? 0 : state.loadPercentage
})

const reduceEnableBudgetItem = (state: BudgetState, name: string): BudgetState => ({
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
                peds: 0,
                url: ''
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
                updatedMap[name] = {
                    ...map[name],
                    budgetList: filteredList
                }
            }
        }
    }

    return updatedMap
}

const reduceDisableBudgetItem = (state: BudgetState, name: string): BudgetState => ({
    ...state,
    disabledItems: {
        ...state.disabledItems,
        names: [ ...state.disabledItems.names, name ]
    },
    list: {
        ...state.list,
        items: state.list.items.filter(i => i.name !== name)
    },
    materials: removeMaterialsByItemName(state.materials, name)
})

const reduceDisableBudgetMaterial = (state: BudgetState, itemName: string, materialName: string): BudgetState => ({
    ...state,
    disabledMaterials: {
        ...state.disabledMaterials,
        [itemName]: [...(state.disabledMaterials[itemName] || []), materialName]
    }
})

const reduceEnableBudgetMaterial = (state: BudgetState, itemName: string, materialName: string): BudgetState => {
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
        disabledMaterials: updatedDisabledMaterials
    };
};

const generateGroupId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9)
}

const reduceAddBudgetGroup = (state: BudgetState, name: string): BudgetState => ({
    ...state,
    groups: {
        ...state.groups,
        list: [
            ...state.groups.list,
            {
                id: generateGroupId(),
                name,
                itemNames: [],
                expanded: true
            }
        ]
    }
})

const reduceRemoveBudgetGroup = (state: BudgetState, groupId: string): BudgetState => ({
    ...state,
    groups: {
        ...state.groups,
        list: state.groups.list.filter(g => g.id !== groupId)
    }
})

const reduceRenameBudgetGroup = (state: BudgetState, groupId: string, name: string): BudgetState => ({
    ...state,
    groups: {
        ...state.groups,
        list: state.groups.list.map(g => g.id === groupId ? { ...g, name } : g)
    }
})

const reduceMoveItemToGroup = (state: BudgetState, itemName: string, groupId: string | null): BudgetState => {
    // Remove item from all groups first
    const updatedList = state.groups.list.map(g => ({
        ...g,
        itemNames: g.itemNames.filter(n => n !== itemName)
    }))

    // Add to target group if groupId is provided
    if (groupId !== null) {
        return {
            ...state,
            groups: {
                ...state.groups,
                list: updatedList.map(g =>
                    g.id === groupId
                        ? { ...g, itemNames: [...g.itemNames, itemName] }
                        : g
                )
            }
        }
    }

    return {
        ...state,
        groups: {
            ...state.groups,
            list: updatedList
        }
    }
}

const reduceToggleBudgetGroupExpanded = (state: BudgetState, groupId: string): BudgetState => ({
    ...state,
    groups: {
        ...state.groups,
        list: state.groups.list.map(g =>
            g.id === groupId ? { ...g, expanded: !g.expanded } : g
        )
    }
})

const reduceToggleBudgetUngroupedExpanded = (state: BudgetState): BudgetState => ({
    ...state,
    groups: {
        ...state.groups,
        ungroupedExpanded: !state.groups.ungroupedExpanded
    }
})

const reduceAddBudgetItemPendingLines = (state: BudgetState, itemName: string, lines: BudgetLineData[]): BudgetState => ({
    ...state,
    list: {
        ...state.list,
        items: state.list.items.map(item =>
            item.name === itemName
                ? { ...item, pendingLines: [...(item.pendingLines || []), ...lines] }
                : item
        )
    }
})

const reduceClearBudgetItemPendingLines = (state: BudgetState, itemName: string): BudgetState => ({
    ...state,
    list: {
        ...state.list,
        items: state.list.items.map(item =>
            item.name === itemName
                ? { ...item, pendingLines: undefined }
                : item
        )
    }
})

const reduceDeleteBudgetPendingLine = (state: BudgetState, itemName: string, lineIndex: number): BudgetState => ({
     ...state,
     list: {
         ...state.list,
         items: state.list.items.map(item => item.name === itemName && item.pendingLines ?
             {
                 ...item,
                 pendingLines: item.pendingLines.filter((_, index) => index !== lineIndex)
             }
             : item
         )
     }
})

const reduceUpdateBudgetPendingLine = (state: BudgetState, itemName: string, lineIndex: number, ped: number, materials: { name: string, quantity: number }[]): BudgetState => ({
    ...state,
    list: {
        ...state.list,
        items: state.list.items.map(item => item.name === itemName && item.pendingLines ?
            {
                ...item,
                pendingLines: item.pendingLines.map((line, index) => index === lineIndex ?
                    { ...line, ped, materials }
                    : line
                )
            }
            : item
        )
    }
})

const reduceRemoveBudgetItemPendingLines = (state: BudgetState, itemName: string, lines: BudgetLineData[]): BudgetState => ({
    ...state,
    list: {
        ...state.list,
        items: state.list.items.map(item => item.name === itemName && item.pendingLines ?
            { 
                ...item, 
                pendingLines: item.pendingLines.filter(line => !lines.some(l => l.date === line.date))
            }
            : item
        )
    }
})

export {
    initialState,
    SHOW_WARNING_THRESHOLD_PED_WITH_MARKUP,
    BalanceMaterialData,
    reduceSetBudgetFromSheet,
    setState,
    cleanForSave,
    setBudgetMaterialExpanded,
    setBudgetStage,
    reduceEnableBudgetItem,
    reduceDisableBudgetItem,
    reduceEnableBudgetMaterial,
    reduceDisableBudgetMaterial,
    reduceAddBudgetGroup,
    reduceRemoveBudgetGroup,
    reduceRenameBudgetGroup,
    reduceMoveItemToGroup,
    reduceToggleBudgetGroupExpanded,
    reduceToggleBudgetUngroupedExpanded,
    reduceAddBudgetItemPendingLines,
    reduceClearBudgetItemPendingLines,
    reduceRemoveBudgetItemPendingLines,
    reduceDeleteBudgetPendingLine,
    reduceUpdateBudgetPendingLine
}
