interface CraftState {
    blueprints: BlueprintData[]
}

interface BlueprintData {
    name: string
    itemName: string
    info: BlueprintInfo
    budget: BlueprintBudget
    inventory?: BlueprintInventory
}

interface BlueprintInfo {
    loading: boolean
    url: string
    itemValue: number
    materials: BlueprintMaterial[]
    errorText?: string
}

interface BlueprintBudget {
    loading: boolean
    stage: number
    clickMUCost?: number
    errorText?: string
}

interface BlueprintInventory {
    itemAvailable: number
    clicksAvailable: number
    clickTTCost: number
    residueNeeded: number
}

interface BlueprintMaterial {
    name: string
    quantity: number
    type: string,
    value: number,
    available?: number // inventory
    clicks?: number // inventory
    markup?: number // budget
    budgetCount?: number // budget
}

interface BluprintWebData {
    Name: string
    ItemValue: string
    StatusCode: number
    Url: string
    Material: BlueprintWebMaterial[]
}

interface BlueprintWebMaterial {
    Name: string
    Quantity: number
    Type: string
    Value: string
}

export {
    CraftState,
    BlueprintData,
    BlueprintMaterial,
    BluprintWebData,
    BlueprintWebMaterial,
}
