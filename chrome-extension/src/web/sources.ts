import { BlueprintWebData, RawMaterialWebData } from "./state"

interface SourceLoadResponse<T> {
    ok: boolean;
    url?: string;
    data?: T; // ok = true
    errorText?: string; // ok = false
}

interface IWebSource {
    name: string
    loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>>
    loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>>
}

export {
    IWebSource,
    SourceLoadResponse,
}
