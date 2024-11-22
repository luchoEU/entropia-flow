import { BlueprintWebData, RawMaterialWebData } from "./state"

interface SourceLoadSuccess<T> {
    ok: true;
    url: string;
    data: T;
}

interface SourceLoadFailure {
    ok: false;
    errorText: string;
}

type SourceLoadResponse<T> = SourceLoadSuccess<T> | SourceLoadFailure;

function isSourceLoadFailure<T>(response: SourceLoadResponse<T>): response is SourceLoadFailure {
    return !response.ok;
}

interface IWebSource {
    name: string
    loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>>
    loadBlueprint(bpName: string): Promise<SourceLoadResponse<BlueprintWebData>>
}

export {
    IWebSource,
    SourceLoadResponse,
    isSourceLoadFailure,
}
