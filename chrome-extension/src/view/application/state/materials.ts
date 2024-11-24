import { WebLoadResponse } from "../../../web/loader"
import { MaterialWebData, RawMaterialWebData } from "../../../web/state"

interface MaterialsState {
    map: MaterialsMap
}

type MaterialsMap = { [name: string] : MaterialState }

interface MaterialStateWebData {
    material?: WebLoadResponse<MaterialWebData>
    rawMaterials?: WebLoadResponse<RawMaterialWebData[]>
}

interface MaterialState {
    buyMarkup?: string,
    buyAmount?: string,
    orderMarkup?: string,
    orderValue?: string,
    useAmount?: string,
    refineAmount?: string,

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
