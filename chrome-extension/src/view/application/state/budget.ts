import { BudgetLineData } from "../../services/api/sheets/sheetsBudget"

interface BudgetState {
    stage: number
    loadPercentage: number
    disabledItems: BudgetDisabledItems
    disabledMaterials: BudgetDisabledMaterials
    materials: BudgetMaterialsMap
    list: BudgetList
    groups: BudgetGroups
}

interface BudgetDisabledItems {
    names: Array<string>
}

type BudgetDisabledMaterials = { [name: string] : Array<string> }

type BudgetMaterialsMap = { [name: string] : BudgetMaterialState }

interface BudgetMaterialState {
    sheetName: string
    expanded: boolean
    unitValue: number // quantity * unitValue = value
    markup: number // value * markup = market value in PEDs
    budgetList: Array<BudgetMaterial>
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
    pendingLines?: BudgetLineData[]
    refreshStatus?: 'idle' | 'loading' | 'loaded'
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

export {
    BudgetState,
    BudgetMaterialsMap,
    BudgetMaterialState,
    BudgetMaterial,
    BudgetDisabledMaterials,
    BudgetItem,
    BudgetGroup,
    BudgetGroups
}
