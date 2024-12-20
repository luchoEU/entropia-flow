interface RawMaterialWebData {
    name: string;
    quantity: number;
}

interface MaterialWebData {
    name: string;
    type: string;
    value: number;
}

interface BlueprintWebData {
    name: string
    type: string
    level: number
    profession: string
    item: BlueprintWebMaterial
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
