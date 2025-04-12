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
    markupUnit: MarkupUnit,
    useAmount?: string,
    refineAmount?: string,
    reserveAmount?: string,
    notes?: string
    calc?: MaterialStateCalcData

    web?: MaterialStateWebData

    // constants
    c: {
        name: string,
        kValue: number // TT value in PED of 1k
    }
}

const UNIT_PERCENTAGE = '%'
const UNIT_PLUS = '+'
const UNIT_PED_K = '/k'

type MarkupUnit = '%' | '+' | '/k'

const nextUnit = (unit: MarkupUnit): MarkupUnit => {
    switch (unit) {
        case UNIT_PERCENTAGE: return UNIT_PLUS
        case UNIT_PLUS: return UNIT_PED_K
        default: return UNIT_PERCENTAGE
    }
}

const unitText = (unit: MarkupUnit): string => unit ?? UNIT_PERCENTAGE

const unitDescription = (unit: MarkupUnit): string => {
    switch (unit) {
        case UNIT_PLUS: return 'added to TT value'
        case UNIT_PED_K: return 'PEDs per 1000'
        case UNIT_PERCENTAGE: default: return 'percentage'
    }
}

interface MaterialStateCalcData {
    quantity: string,
    total: string,
    totalMU: string
}

export {
    UNIT_PERCENTAGE,
    UNIT_PLUS,
    UNIT_PED_K,
    MarkupUnit,
    nextUnit,
    unitText,
    unitDescription,
    MaterialsState,
    MaterialsMap,
    MaterialState,
    MaterialStateWebData,
    MaterialStateCalcData,
}
