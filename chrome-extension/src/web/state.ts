interface RawMaterialWebData {
    name: string;
    quantity: number;
}

interface BlueprintWebData {
    itemValue: number
    materials: BlueprintWebMaterial[]
}

interface BlueprintWebMaterial {
    name: string
    type: string
    quantity: number
    value: number
}

export {
    RawMaterialWebData,
    BlueprintWebData,
    BlueprintWebMaterial,
}
