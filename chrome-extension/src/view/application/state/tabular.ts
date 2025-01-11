import { RowValue } from "../../components/common/SortableTabularSection.data"
import { SortSecuence } from "./sort"

// To be used with SortableTabularSection
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
}

interface TabularDefinition<TItem = any, TValueForSort = any> {
    title: string,
    columns: string[],
    getRow: (item: TItem, index: number) => RowValue[],
    getRowForSort?: (item: TItem, index: number) => TValueForSort[], // if not defined it uses getRow
    columnComparer?: ((a: TValueForSort, b: TValueForSort) => number)[], // if not defined it uses byTypeComparer
    justifiyContent?: ('start' | 'end' | 'center')[], // if not defined it uses right for numbers and left for others
}

type TabularDefinitions = { [selector: string]: TabularDefinition }

interface TabularStats {
    count: number,
    ped?: string,
    itemTypeName?: string
}

export {
    TabularState,
    TabularStateData,
    TabularStats,
    TabularDefinition,
    TabularDefinitions,
}
