interface RawMaterialWebData {
    name: string;
    quantity: number;
}

interface MaterialWebData {
    type: string;
    value: number;
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
    url?: string
}

export {
    RawMaterialWebData,
    MaterialWebData,
    BlueprintWebData,
    BlueprintWebMaterial,
}
