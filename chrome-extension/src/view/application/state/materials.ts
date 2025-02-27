import { WebLoadResponse } from "../../../web/loader"
import { ItemUsageWebData, MaterialWebData, RawMaterialWebData } from "../../../web/state"

interface MaterialsState {
    map: MaterialsMap
}

type MaterialsMap = { [name: string] : MaterialState }

interface MaterialStateWebData {
    material?: WebLoadResponse<MaterialWebData>
    rawMaterials?: WebLoadResponse<RawMaterialWebData[]>
    usage?: WebLoadResponse<ItemUsageWebData>
}

interface MaterialState {
    buyMarkup?: string,
    buyMarkupModified?: string,
    buyAmount?: string,
    orderMarkup?: string,
    orderValue?: string,
    useAmount?: string,
    refineAmount?: string,
    notes?: string

    web?: MaterialStateWebData

    // constants
    c: {
        name: string,
        unit: string, // of markup (i.e % or ped/k)
        kValue: number // TT value in PED of 1k
    }
}

export {
    MaterialsState,
    MaterialsMap,
    MaterialState,
    MaterialStateWebData,
}
