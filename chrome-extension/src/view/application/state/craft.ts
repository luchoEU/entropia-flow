interface CraftState {
    blueprints: BlueprintData[]
}

interface BlueprintData {
    name: string
    materials: BlueprintMaterial[]
}

interface BlueprintMaterial {
    name: string
    quantity: number
}

interface BluprintWebData {
    Name: string
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
