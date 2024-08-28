interface BudgetState {
    stage: number
    loadPercentage: number
    disabled: BudgetDisabled
    materials: BudgetMaterials
    list: BudgetList
}

interface BudgetDisabled {
    expanded: boolean
    names: Array<string>
}

interface BudgetMaterials {
    expanded: boolean
    map: BudgetMaterialsMap
}

type BudgetMaterialsMap = { [name: string] : BudgetMaterialState }

interface BudgetMaterialState {
    expanded: boolean
    total: number
    list: Array<BudgetMaterial>
}

interface BudgetMaterial {
    itemName: string
    quantity: number
}

interface BudgetList {
    expanded: boolean
    items: Array<BudgetItem>
}

interface BudgetItem {
    name: string
    totalMU: number
    total: number
    peds: number
}

export {
    BudgetState,
    BudgetMaterialsMap,
    BudgetItem
}
