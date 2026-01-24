import { objectMap } from "../../../common/object"
import { ItemData } from "../../../common/state"
import { STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages"
import { BudgetLineData } from "../../services/api/sheets/sheetsBudget"
import { BudgetDisabledMaterials, BudgetItem, BudgetMaterialsMap, BudgetMaterialState, BudgetState } from "../state/budget"
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
    materials: {
        disabled: {},
        map: {}
    },
    list: {
        disabled: [],
        items: []
    },
    groups: {
        list: [],
        ungroupedExpanded: true
    }
}

const setState = (state: BudgetState, inState: BudgetState): BudgetState => inState

const SHOW_WARNING_THRESHOLD_PED_WITH_MARKUP = 50

const reduceSetBudgetFromSheet = (state: BudgetState, map: BudgetMaterialsMap, items: BudgetItem[], loadPercentage: number): BudgetState => {
    const mapc: BudgetMaterialsMap = objectMap(map, (v: BudgetMaterialState, k: string) => ({
        ...v,
        expanded: state.materials.map[k]?.expanded ?? false
    }))
    return {
        ...state,
        loadPercentage,
        materials: {
            ...state.materials,
            map: mapc
        },
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
    cState.materials.map[material].expanded = expanded
    return cState
}

const setBudgetStage = (state: BudgetState, stage: number): BudgetState => ({
    ...state,
    stage,
    loadPercentage: stage === STAGE_INITIALIZING ? 0 : state.loadPercentage
})

const reduceEnableBudgetItem = (state: BudgetState, name: string): BudgetState => ({
    ...state,
    list: {
        ...state.list,
        disabled: state.list.disabled.filter(n => n !== name),
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
    list: {
        ...state.list,
        disabled: [...state.list.disabled, name],
        items: state.list.items.filter(i => i.name !== name)
    },
    materials: {
        ...state.materials,
        map: removeMaterialsByItemName(state.materials.map, name)
    }
})

const reduceDisableBudgetMaterial = (state: BudgetState, itemName: string, materialName: string): BudgetState => ({
    ...state,
    materials: {
        ...state.materials,
        disabled: {
            ...state.materials.disabled,
            [itemName]: [...(state.materials.disabled[itemName] || []), materialName]
        }
    }
})

const reduceEnableBudgetMaterial = (state: BudgetState, itemName: string, materialName: string): BudgetState => {
    const updatedDisabled = {
        ...state.materials.disabled,
        [itemName]: (state.materials.disabled[itemName] || []).filter(name => name !== materialName)
    };

    // Remove the entry if the list is empty
    if (updatedDisabled[itemName].length === 0) {
        delete updatedDisabled[itemName];
    }

    return {
        ...state,
        materials: {
            ...state.materials,
            disabled: updatedDisabled
        }
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

const reduceToggleBudgetShowDisabled = (state: BudgetState): BudgetState => ({
    ...state,
    list: {
        ...state.list,
        showDisabled: !state.list.showDisabled
    }
})

const reduceEnableBudgetGroup = (state: BudgetState, groupId: string): BudgetState => ({
    ...state,
    groups: {
        ...state.groups,
        disabledGroups: (state.groups.disabledGroups || []).filter(id => id !== groupId)
    }
})

const reduceDisableBudgetGroup = (state: BudgetState, groupId: string): BudgetState => ({
    ...state,
    groups: {
        ...state.groups,
        disabledGroups: [...(state.groups.disabledGroups || []), groupId]
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
    reduceUpdateBudgetPendingLine,
    reduceToggleBudgetShowDisabled,
    reduceEnableBudgetGroup,
    reduceDisableBudgetGroup
}
