import { objectMap } from "../../../common/object"
import { STAGE_INITIALIZING } from "../../services/api/sheets/sheetsStages"
import { BudgetGroup, BudgetItem, BudgetMaterialsMap, BudgetMaterialState, BudgetSelection, BudgetState } from "../state/budget"

const initialState: BudgetState = {
    stage: STAGE_INITIALIZING,
    loadPercentage: 0,
    disabledItems: {
        names: []
    },
    disabledMaterials: { },
    materials: {
        selectedCount: 0,
        map: { }
    },
    list: {
        items: []
    },
    groups: {
        list: [],
        ungroupedExpanded: true
    },
    selection: null
}

const setState = (state: BudgetState, inState: BudgetState): BudgetState => ({
    ...inState,
    materials: {
        ...inState.materials,
        map: objectMap(inState.materials.map, fillBudgetMaterialCalc)
    }
})

function fillBudgetMaterialCalc(state: BudgetMaterialState): BudgetMaterialState {
    const totalBudgetQuantity = state.budgetList.reduce((sum, item) => sum + item.quantity, 0);
    const totalRealQuantity = state.realList.reduce((sum, item) => item.disabled ? sum : sum + item.quantity, 0);
    const totalBudget = totalBudgetQuantity * state.unitValue;
    const totalReal = totalRealQuantity * state.unitValue;
    const balanceQuantity = totalBudgetQuantity + totalRealQuantity
    const balance = balanceQuantity * state.unitValue;
    const balanceWithMarkup = balance * state.markup;
    return {
        ...state,
        c: {
            totalBudgetQuantity,
            totalRealQuantity,
            totalBudget,
            totalReal,
            balanceQuantity,
            balance,
            balanceWithMarkup
        }
    }
}

const SHOW_WARNING_THRESHOLD_PED_WITH_MARKUP = 50

const reduceSetBudgetFromSheet = (state: BudgetState, map: BudgetMaterialsMap, items: BudgetItem[], loadPercentage: number): BudgetState => {
    const mapc = objectMap(map, (v, k) => {
        const vc = fillBudgetMaterialCalc(v)
        return {
            ...vc,
            expanded: state.materials.map[k]?.expanded ?? false,
            selected: Math.abs(vc.c.balanceWithMarkup) >= SHOW_WARNING_THRESHOLD_PED_WITH_MARKUP
        }
    })
    return {
        ...state,
        loadPercentage,
        materials: {
            ...state.materials,
            map: mapc,
            selectedCount: Object.keys(mapc).filter(key => mapc[key].selected).length
        },
        list: {
            ...state.list,
            items
        }
    }
}

const cleanForSave = (state: BudgetState): BudgetState => ({
    ...state,
    stage: STAGE_INITIALIZING,
    materials: {
        ...state.materials,
        map: objectMap(state.materials.map, (v) => ({ ...v, c: undefined}))
    }
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
                updatedMap[name] = fillBudgetMaterialCalc({
                    ...map[name],
                    budgetList: filteredList
                })
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
    materials: {
        ...state.materials,
        map: removeMaterialsByItemName(state.materials.map, name)
    }
})

const reduceDisableBudgetMaterial = (state: BudgetState, itemName: string, materialName: string): BudgetState => ({
    ...state,
    disabledMaterials: {
        ...state.disabledMaterials,
        [itemName]: [...(state.disabledMaterials[itemName] || []), materialName]
    },
    materials: {
        ...state.materials,
        map: {
            ...state.materials.map,
            [itemName]: fillBudgetMaterialCalc({
                ...state.materials.map[itemName],
                realList: state.materials.map[itemName].realList.map(material => 
                    material.itemName === materialName ? { ...material, disabled: true } : material
                )
            })
        }
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
        disabledMaterials: updatedDisabledMaterials,
        materials: {
            ...state.materials,
            map: {
                ...state.materials.map,
                [itemName]: fillBudgetMaterialCalc({
                    ...state.materials.map[itemName],
                    realList: state.materials.map[itemName].realList.map(material => 
                        material.itemName === materialName ? { ...material, disabled: false } : material
                    )
                })
            }
        }
    };
};

const reduceAddBudgetMaterialSelection = (state: BudgetState, materialName: string): BudgetState => ({
    ...state,
    materials: {
        ...state.materials,
        map: {
            ...state.materials.map,
            [materialName]: {
                ...state.materials.map[materialName],
                selected: true
            }
        },
        selectedCount: Object.keys(state.materials.map).filter(key => state.materials.map[key].selected || key === materialName).length
    }
})

const reduceRemoveBudgetMaterialSelection = (state: BudgetState, materialName: string): BudgetState => ({
    ...state,
    materials: {
        ...state.materials,
        map: {
            ...state.materials.map,
            [materialName]: {
                ...state.materials.map[materialName],
                selected: false
            }
        },
        selectedCount: Object.keys(state.materials.map).filter(key => state.materials.map[key].selected && key !== materialName).length
    }
})

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

const getGroupTotals = (group: BudgetGroup, items: BudgetItem[]): { peds: number, totalMU: number, total: number } => {
    const groupItems = items.filter(i => group.itemNames.includes(i.name))
    return {
        peds: groupItems.reduce((sum, i) => sum + i.peds, 0),
        totalMU: groupItems.reduce((sum, i) => sum + i.totalMU, 0),
        total: groupItems.reduce((sum, i) => sum + i.total, 0)
    }
}

const getUngroupedItems = (state: BudgetState): BudgetItem[] => {
    const groupedItemNames = new Set(state.groups.list.flatMap(g => g.itemNames))
    return state.list.items.filter(i => !groupedItemNames.has(i.name))
}

const reduceSetBudgetSelection = (state: BudgetState, selection: BudgetSelection): BudgetState => ({
    ...state,
    selection
})

export {
    initialState,
    SHOW_WARNING_THRESHOLD_PED_WITH_MARKUP,
    reduceSetBudgetFromSheet,
    setState,
    cleanForSave,
    setBudgetMaterialExpanded,
    setBudgetStage,
    reduceEnableBudgetItem,
    reduceDisableBudgetItem,
    reduceEnableBudgetMaterial,
    reduceDisableBudgetMaterial,
    reduceAddBudgetMaterialSelection,
    reduceRemoveBudgetMaterialSelection,
    reduceAddBudgetGroup,
    reduceRemoveBudgetGroup,
    reduceRenameBudgetGroup,
    reduceMoveItemToGroup,
    reduceToggleBudgetGroupExpanded,
    reduceToggleBudgetUngroupedExpanded,
    reduceSetBudgetSelection,
    getGroupTotals,
    getUngroupedItems
}
