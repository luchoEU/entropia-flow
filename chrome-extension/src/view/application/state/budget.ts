import { BudgetLineData } from "../../services/api/sheets/sheetsBudget"

interface BudgetState {
    stage: number
    loadPercentage: number
    materials: BudgetMaterials
    list: BudgetList
    groups: BudgetGroups
}

type BudgetMaterials = {
    disabled?: BudgetDisabledMaterials
    map: BudgetMaterialsMap
}

type BudgetDisabledMaterials = { [name: string] : Array<string> } // disabled inventory in each material
type BudgetMaterialsMap = { [name: string] : BudgetMaterialState }

interface BudgetMaterialState {
    sheetName: string
    expanded?: boolean
    unitValue: number // quantity * unitValue = value
    markup: number // value * markup = market value in PEDs
    budgetList: Array<BudgetMaterial>
    disabled?: Array<string>
}

interface BudgetMaterial {
    itemName: string
    quantity: number
}

interface BudgetList {
    disabled?: Array<string>
    showDisabled?: boolean
    items: Array<BudgetItem>
}

interface BudgetItem {
    name: string
    totalMU: number
    total: number
    peds: number
    url: string
    isBlueprint?: boolean
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
    disabledGroups?: string[]
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
