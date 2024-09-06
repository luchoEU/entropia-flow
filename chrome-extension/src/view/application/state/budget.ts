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
    selectedCount: number
    map: BudgetMaterialsMap
}

type BudgetMaterialsMap = { [name: string] : BudgetMaterialState }

interface BudgetMaterialState {
    expanded: boolean
    selected: boolean
    totalListQuantity: number // sum(list.quantity)
    quantityBalance: number // sum(list.quantity) - sum(stored.quantity)
    unitValue: number // quantity * unitValue = value
    markup: number // value * markup = market value in PEDs
    budgetList: Array<BudgetMaterial>
    realList: Array<BudgetMaterial>
}

interface BudgetMaterial {
    itemName: string
    disabled: boolean
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
    BudgetMaterialState,
    BudgetItem
}
