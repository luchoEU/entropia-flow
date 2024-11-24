import { BlueprintWebData, MaterialWebData, RawMaterialWebData } from "./state"

interface SourceLoadResponse<T> {
    ok: boolean;
    url?: string;
    data?: T; // ok = true
    errorText?: string; // ok = false
}

interface IWebSource {
    name: string
    loadMaterial(materialName: string): Promise<SourceLoadResponse<MaterialWebData>>
    loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>>
    loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>>
}

const NOT_IMPLEMENTED: SourceLoadResponse<any> = { ok: false, errorText: 'not implemented' }

export {
    IWebSource,
    SourceLoadResponse,
    NOT_IMPLEMENTED,
}
