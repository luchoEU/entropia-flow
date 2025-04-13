import { WebLoadResponse } from "../../../web/loader"
import { ItemUsageWebData, ItemWebData, RawMaterialWebData } from "../../../web/state"

interface ItemsState {
    map: ItemsMap
}

type ItemsMap = { [name: string] : ItemState }

interface ItemStateWebData {
    item?: WebLoadResponse<ItemWebData>
    rawMaterials?: WebLoadResponse<RawMaterialWebData[]>
    usage?: WebLoadResponse<ItemUsageWebData>
}

interface ItemState {
    name: string,
    markup: ItemStateMarkupData,
    reserveAmount?: string,
    notes?: string
    calc?: ItemStateCalcData
    web?: ItemStateWebData
    refined?: ItemStateRefinedData
}

interface ItemStateMarkupData {
    value?: string,
    modified?: string,
    unit?: MarkupUnit
}

interface ItemStateRefinedData {
    buyAmount?: string,
    orderMarkup?: string,
    orderValue?: string,
    useAmount?: string,
    refineAmount?: string,
    kValue: number // TT value in PED of 1k
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

interface ItemStateCalcData {
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
    ItemsState,
    ItemsMap,
    ItemState,
    ItemStateMarkupData,
    ItemStateWebData,
    ItemStateCalcData,
    ItemStateRefinedData,
}
