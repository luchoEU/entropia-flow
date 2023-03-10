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
    itemValue: string
    materials: BlueprintMaterial[]
    errorText?: string
}

interface BlueprintBudget {
    loading: boolean
    stage: number
    errorText?: string
}

interface BlueprintInventory {
    itemAvailable: number
    clickCost: string
    residueNeeded: string
}

interface BlueprintMaterial {
    name: string
    quantity: number
    type: string,
    value: string,
    available?: number // inventory
    clicks?: number // inventory
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
