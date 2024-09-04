interface BudgetState {
    stage: number
    loadPercentage: number
    disabledItems: BudgetDisabledItems
    disabledMaterials: BudgetDisabledMaterials
    materials: BudgetMaterials
    list: BudgetList
}

interface BudgetDisabledItems {
    expanded: boolean
    names: Array<string>
}

type BudgetDisabledMaterials = { [name: string] : Array<string> }

interface BudgetMaterials {
    expanded: boolean
    map: BudgetMaterialsMap
}

type BudgetMaterialsMap = { [name: string] : BudgetMaterialState }

interface BudgetMaterialState {
    expanded: boolean
    totalListQuantity: number // sum(list.quantity)
    quantityBalance: number // sum(list.quantity) - sum(stored.quantity)
    valueBalance: number // sum(list.value) - sum(stored.value)
    budgetList: Array<BudgetMaterial>
    realList: Array<BudgetMaterial>
}

interface BudgetMaterial {
    itemName: string
    disabled: boolean
    quantity: number
    value: number
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
