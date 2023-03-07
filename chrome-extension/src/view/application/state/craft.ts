interface CraftState {
    blueprints: BlueprintData[]
}

interface BlueprintData {
    name: string
    loading: boolean
    url: string
    materials: BlueprintMaterial[]
    error: string
}

interface BlueprintMaterial {
    name: string
    quantity: number
}

interface BluprintWebData {
    Name: string
    StatusCode: number,
    Url: string,
    Material: BlueprintWebMaterial[]
}

interface BlueprintWebMaterial {
    Name: string
    Quantity: number
    Value: string
}

export {
    CraftState,
    BlueprintData,
    BlueprintMaterial,
    BluprintWebData,
    BlueprintWebMaterial,
}
