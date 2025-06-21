import { TTServiceInventoryWebData } from "../view/application/state/ttService";
import { BlueprintWebData, BlueprintWebMaterial, ItemUsageWebData, ItemWebData, RawMaterialWebData } from "./state"

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
    loadItem(itemName: string, bpMaterial?: BlueprintWebMaterial): Promise<SourceLoadResponse<ItemWebData>>
    loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>>
    loadUsage(itemName: string): Promise<SourceLoadResponse<ItemUsageWebData>>
    loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>>
    loadBlueprintList(): Promise<SourceLoadResponse<string[]>>
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
