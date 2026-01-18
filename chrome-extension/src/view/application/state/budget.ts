interface BudgetState {
    stage: number
    loadPercentage: number
    disabledItems: BudgetDisabledItems
    disabledMaterials: BudgetDisabledMaterials
    materials: BudgetMaterials
    list: BudgetList
    groups: BudgetGroups
    selection: BudgetSelection
}

interface BudgetDisabledItems {
    names: Array<string>
}

type BudgetDisabledMaterials = { [name: string] : Array<string> }

interface BudgetMaterials {
    selectedCount: number
    map: BudgetMaterialsMap
}

type BudgetMaterialsMap = { [name: string] : BudgetMaterialState }

interface BudgetMaterialState {
    sheetName: string
    expanded: boolean
    selected: boolean
    unitValue: number // quantity * unitValue = value
    markup: number // value * markup = market value in PEDs
    budgetList: Array<BudgetMaterial>
    realList: Array<BudgetMaterial>
    c: BudgetMaterialCalcState // calculated from previous
}

interface BudgetMaterialCalcState {
    totalBudgetQuantity: number // sum(budgetList.quantity)
    totalRealQuantity: number // sum(realList.quantity)
    totalBudget: number // totalBudgetQuantity * unitValue
    totalReal: number // totalRealQuantity * unitValue
    balanceQuantity: number // totalBudgetQuantity - totalRealQuantity
    balance: number // balanceQuantity * unitValue
    balanceWithMarkup: number // balance * markup
}

interface BudgetMaterial {
    itemName: string
    disabled: boolean
    quantity: number
}

interface BudgetList {
    items: Array<BudgetItem>
}

interface BudgetItem {
    name: string
    totalMU: number
    total: number
    peds: number
    url: string
}

interface BudgetGroup {
    id: string
    name: string
    itemNames: string[]
    expanded: boolean
}

interface BudgetGroups {
    list: BudgetGroup[]
    ungroupedExpanded: boolean
}

type BudgetSelection =
    | { type: 'group'; groupId: string }
    | { type: 'item'; itemName: string }
    | null

export {
    BudgetState,
    BudgetMaterialsMap,
    BudgetMaterialState,
    BudgetItem,
    BudgetGroup,
    BudgetGroups,
    BudgetSelection
}
