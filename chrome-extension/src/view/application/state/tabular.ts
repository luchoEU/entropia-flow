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
    },
    data?: any
}

interface TabularDefinition<TItem = any, TValueForSort = any, TData = any> {
    title: string,
    columns: string[],
    getRow: (item: TItem, rowIndex: number) => RowValue[],
    getRowForSort?: (item: TItem, rowIndex: number) => TValueForSort[], // if not defined it uses getRow
    columnComparer?: ((a: TValueForSort, b: TValueForSort) => number)[], // if not defined it uses byTypeComparer
    columnVisible?: (data: TData) => boolean[], // if not defined all are visible
    columnHeaderAfterName?: RowValue[],
    justifiyContent?: ('start' | 'end' | 'center')[], // if not defined it uses right for numbers and left for others
    getPedValue?: (item: TItem) => number, // to calculate the ped total
}

type TabularDefinitions = { [selector: string]: TabularDefinition }

type TabularRawData<TItem = any, TData = any> = { [selector: string]: { data?: TData, items: TItem[] } }

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
    TabularRawData,
}
