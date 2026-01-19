interface BudgetState {
    stage: number
    loadPercentage: number
    disabledItems: BudgetDisabledItems
    disabledMaterials: BudgetDisabledMaterials
    materials: BudgetMaterials
    list: BudgetList
    groups: BudgetGroups
    selection: BudgetSelection
    c?: BudgetStateCalc
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
    balanceQuantity: number // totalRealQuantity - totalBudgetQuantity
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
    | { type: 'group'; groupId: string; materialName?: string }
    | { type: 'item'; itemName: string; materialName?: string }
    | null

interface BudgetLineData {
    reason: string
    ped?: number
    materials: {
        name: string
        quantity: number
    }[]
}

interface BudgetStateCalc {
    pendingLines?: { [itemName: string]: BudgetLineData[] }
}

export {
    BudgetState,
    BudgetMaterialsMap,
    BudgetMaterialState,
    BudgetItem,
    BudgetGroup,
    BudgetGroups,
    BudgetSelection,
    BudgetLineData
}
