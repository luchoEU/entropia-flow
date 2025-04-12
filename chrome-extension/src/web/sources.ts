import { TTServiceInventoryWebData } from "../view/application/state/ttService";
import { BlueprintWebData, ItemUsageWebData, MaterialWebData, RawMaterialWebData } from "./state"

interface SourceLoadResponse<T> {
    ok: boolean;
    url?: string;
    data?: T; // ok = true
    errorText?: string; // ok = false
}

interface ISource {
    name: string
}

interface IWebSource extends ISource {
    loadMaterial(materialName: string, materialUrl?: string): Promise<SourceLoadResponse<MaterialWebData>>
    loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>>
    loadUsage(itemName: string): Promise<SourceLoadResponse<ItemUsageWebData>>
    loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>>
}

interface ISheetSource extends ISource {
    loadTTServiceInventory(): Promise<SourceLoadResponse<TTServiceInventoryWebData>>
}

const NOT_IMPLEMENTED: SourceLoadResponse<any> = { ok: false, errorText: 'not implemented' }

export {
    ISource,
    IWebSource,
    ISheetSource,
    SourceLoadResponse,
    NOT_IMPLEMENTED,
}
