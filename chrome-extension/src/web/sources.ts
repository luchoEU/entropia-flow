import { BlueprintWebData, ItemUsageWebData, MaterialWebData, RawMaterialWebData } from "./state"

interface SourceLoadResponse<T> {
    ok: boolean;
    url?: string;
    data?: T; // ok = true
    errorText?: string; // ok = false
}

interface IWebSource {
    name: string
    loadMaterial(materialName: string, materialUrl?: string): Promise<SourceLoadResponse<MaterialWebData>>
    loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>>
    loadUsage(itemName: string): Promise<SourceLoadResponse<ItemUsageWebData>>
    loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>>
}

const NOT_IMPLEMENTED: SourceLoadResponse<any> = { ok: false, errorText: 'not implemented' }

export {
    IWebSource,
    SourceLoadResponse,
    NOT_IMPLEMENTED,
}
