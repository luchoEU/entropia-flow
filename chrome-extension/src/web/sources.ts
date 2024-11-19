import { FetchResponse } from "./fetch";
import { EntropiaNexus } from "./nexus";
import { EntropiaWiki } from "./wiki";

interface IWebSource {
    name: string
    loadRawMaterials(materialName: string): Promise<LoadResponse<RawMaterialWebData[]>>
}

interface LoadResponse<T> {
    ok: boolean
    errorText?: string
    data?: T
}

interface RawMaterialWebData {
    name: string;
    quantity: number;
}

const WebSources: IWebSource[]  = [ new EntropiaNexus(), new EntropiaWiki() ]

function mapResponse<TF,TR>(response: FetchResponse<TF>, mapper: (data: TF) => TR): LoadResponse<TR> {
    return {
        ok: response.ok,
        errorText: response.errorText ?? `Status code: ${response.status}`,
        data: response.result && mapper(response.result)
    }
}

export {
    IWebSource,
    LoadResponse,
    RawMaterialWebData,
    WebSources,
    mapResponse
}
