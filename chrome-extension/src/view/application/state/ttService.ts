import { WebLoadResponse } from "../../../web/loader"

interface TTServiceState {
    web?: TTServiceStateWebData
}

interface TTServiceStateWebData {
    inventory?: WebLoadResponse<TTServiceInventoryWebData>
}

type TTServiceInventoryWebData = Array<TTServiceSheetItem>

interface TTServiceSheetItem {
    date: string
    player: string
    name: string
    quantity: number
    value: number
}

const initialState: TTServiceState = { }

export {
    TTServiceState,
    TTServiceStateWebData,
    TTServiceInventoryWebData,
    TTServiceSheetItem,
    initialState,
}