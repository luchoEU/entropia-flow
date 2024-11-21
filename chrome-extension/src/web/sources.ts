import { RawMaterialWebData } from "./state"

interface SourceLoadResponse<T> {
    ok: boolean
    errorText?: string
    data?: T
}

interface IWebSource {
    name: string
    loadRawMaterials(materialName: string): Promise<SourceLoadResponse<RawMaterialWebData[]>>
}

export {
    IWebSource,
    SourceLoadResponse
}
