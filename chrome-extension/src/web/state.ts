interface RawMaterialWebData {
    name: string;
    quantity: number;
}

interface ItemWebData {
    name: string;
    type: string;
    value: number;
}

interface ItemUsageWebData {
    blueprints: Array<BlueprintWebData>
    refinings: Array<RefiningWebData>
}

interface RefiningWebData {
    ingredients: Array<RawMaterialWebData>
    product: RawMaterialWebData
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
    ItemWebData,
    ItemUsageWebData,
    BlueprintWebData,
    BlueprintWebMaterial,
}
