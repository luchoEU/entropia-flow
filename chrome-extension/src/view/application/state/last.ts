import { ViewItemData } from "./history";

interface ViewPedData {
    key: number
    value: string
}

interface LastRequiredState {
    show: boolean,
    text?: string,
    delta?: number,
    expanded?: boolean,
    date: number,
    diff: Array<ViewItemData>,
    peds: Array<ViewPedData>,
    sortType: number,
    blacklist: Array<string>,
    permanentBlacklist: Array<string>,
}

export {
    ViewPedData,
    LastRequiredState
}