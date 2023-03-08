interface CraftState {
    blueprints: BlueprintData[]
}

interface BlueprintData {
    name: string
    loading: boolean
    url: string
    itemName: string
    itemValue: string
    itemAvailable: number
    materials: BlueprintMaterial[]
    error: string
    clickCost: string
}

interface BlueprintMaterial {
    name: string
    quantity: number
    type: string,
    value: string,
    available: number
    clicks: number
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
