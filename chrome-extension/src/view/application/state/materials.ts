import { RawMaterialWebData } from "../../../web/sources"

interface MaterialsState {
    map: MaterialsMap
}

type MaterialsMap = { [name: string] : MaterialState }

interface MaterialStateWebData {
    loading?: {
        source: string
    }
    errors?: {
        message: string
    }[]
    rawMaterials?: RawMaterialWebData[]
}

interface MaterialState {
    buyMarkup: string,
    buyAmount: string,
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
