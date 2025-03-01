import { WebLoadResponse } from "../../../web/loader"

interface TTServiceState {
    web?: {
        inventory?: WebLoadResponse<TTServiceInventoryWebData>
    }
}

type TTServiceInventoryWebData = Array<TTServiceItem>

interface TTServiceItem {
    date: string
    player: string
    name: string
    quantity: number
    value: number
}

export {
    TTServiceState,
    TTServiceItem
}