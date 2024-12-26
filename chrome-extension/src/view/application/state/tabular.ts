import { SortColumnDefinition } from "../helpers/sort"
import { SortSecuence } from "./sort"

// To be used with SortableTableSection
type TabularState = { [selector: string]: TabularStateData }

interface TabularStateData {
    expanded: boolean,
    filter: string,
    sortSecuence?: SortSecuence,
    items?: { // don't serialize
        all: any[],
        show: any[], // all with filter
        stats: TabularStats, // of show
    }
    definition?: { // don't serialize
        sort?: Array<SortColumnDefinition<any>>,
    }
}

interface TabularStats {
    count: number,
    ped?: string,
    itemTypeName?: string
}

export {
    TabularState,
    TabularStateData,
    TabularStats,
}
