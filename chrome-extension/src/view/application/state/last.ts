import { ViewItemData } from "./history";

interface ViewPedData {
    key: number
    value: string
}

interface LastRequiredState {
    c: { // not persisted
        anyInventory: boolean,
        text?: string,
        delta?: number,
        date: number,
        diff?: Array<ViewItemData>,
    }

    expanded?: boolean,
    sortType: number,
    showMarkup: boolean,
    blacklist: Array<string>,
    permanentBlacklist: Array<string>,
    peds: Array<ViewPedData>,
    notificationsDone: Array<string>,
}

export {
    ViewPedData,
    LastRequiredState
}