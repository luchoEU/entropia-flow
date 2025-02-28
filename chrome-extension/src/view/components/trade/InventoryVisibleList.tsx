import React from 'react'
import { hideByContainer, hideByName, hideByValue, setVisibleInventoryExpanded, setVisibleInventoryFilter, showTradingItemData, sortTradeFavoriteBlueprintsBy, sortTradeOtherBlueprintsBy, sortTradeOwnedBlueprintsBy, sortVisibleBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, sortColumnDefinition, TT_SERVICE_COLUMN, VALUE } from '../../application/helpers/inventory.sort'
import { SortableFixedSizeTable as SortableFixedSizeTable1, TableData } from '../common/SortableTableSection'
import { calculate, SortableFixedSizeTable, TableData as TableData2 } from '../common/SortableTableSection2'
import { getTradeFavoriteBlueprintItem, getTradeItemData, getTradeOtherBlueprintItem, getTradeOwnedBlueprintItem, getVisibleInventory, getVisibleInventoryItem } from '../../application/selectors/inventory';
import { useDispatch, useSelector } from 'react-redux'
import { SHOW_TT_SERVICE } from '../../../config'
import { getTTServiceItemValues } from '../../application/selectors/ttService'
import { reloadTTService } from '../../application/actions/ttService'
import { INVENTORY_TABULAR_OWNED, ItemVisible, TradeBlueprintLineData } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'
import SearchInput from '../common/SearchInput'
import SortableTabularSection from '../common/SortableTabularSection'

const tableData: TableData<ItemVisible> = {
    columns: [NAME, QUANTITY, VALUE, CONTAINER, TT_SERVICE_COLUMN],
    definition: sortColumnDefinition,
    sortRow: {
        [NAME]: { justifyContent: 'center' },
        [QUANTITY]: { justifyContent: 'end' },
        [VALUE]: { justifyContent: 'end' },
        [TT_SERVICE_COLUMN]: { justifyContent: 'end', show: SHOW_TT_SERVICE, sortable: false, sub: [
            { title: 'Reload TT Service from sheet', imgButton: { src: 'img/reload.png', dispatch: () => reloadTTService }}
        ] },
    },
    getRow: (item: ItemVisible) => ({
        dispatch: () => showTradingItemData(item.c?.showingTradeItem ? undefined : item.data.n),
        columns: {
            [NAME]: {
                sub: [{
                    title: 'Hide this item name', imgButton: { src: 'img/cross.png', dispatch: () => hideByName(item.data.n) }
                }, {
                    itemText: item.data.n
                }, {
                    flex: 1, img: { src: item.c?.showingTradeItem ? 'img/left.png' : 'img/right.png' }
                }, {
                    title: 'Search by this item name', imgButton: { src: 'img/find.png', dispatch: () => setVisibleInventoryFilter(`!${item.data.n}`) }
                }]
            },
            [QUANTITY]: {
                style: { justifyContent: 'center' },
                sub: [{ itemText: item.data.q }]
            },
            [VALUE]: {
                style: { justifyContent: 'end' },
                sub: [{
                    title: 'Hide this value or lower', imgButton: { src: 'img/cross.png', dispatch: () => hideByValue(item.data.v) }
                }, {
                    itemText: item.data.v + ' PED'
                }]
            },
            [CONTAINER]: {
                sub: [{
                    title: 'Hide this container', imgButton: { src: 'img/cross.png', dispatch: () => hideByContainer(item.data.c) }
                }, {
                    itemText: item.data.c
                }]
            },
            [TT_SERVICE_COLUMN]: {
                sub: [{
                    itemText: item.c?.ttServiceValue?.toFixed(2) + ' PED'
                }]
            }
        }
    })
};

const getBlueprintsTableData = (type: string): TableData2<TradeBlueprintLineData> => ({
    sortRow: [
        { justifyContent: 'center', text: type + ' Blueprint' }, // BP_NAME
        { justifyContent: 'end', text: 'Quantity per Click' }, // QUANTITY
    ],
    getRow: (item: TradeBlueprintLineData) => ({
        columns: [
            { // BP_NAME
                style: { justifyContent: 'start' },
                sub: [{ itemText: item.bpName }]
            },
            { // QUANTITY
                style: { justifyContent: 'center' },
                sub: [{ itemText: item.quantity?.toString() }]
            }
        ]
    })
})

const MySortableTableSection = <TItem extends any>(p: {
    title: string,
    expanded: boolean,
    filter: string,
    stats: { count: number, ped?: string, itemTypeName?: string },
    setExpanded: (expanded: boolean) => any,
    setFilter: (v: string) => any,
    table: any,
    children: any
}) => {
    const stats = p.stats;
    const table = p.children ? {
        ...p.table,
        tableData: {
            ...p.table.tableData,
            sortRow: {
                ...p.table.tableData.sortRow,
                [CONTAINER]: { show: false },
                [TT_SERVICE_COLUMN]: { show: false }
            }
        }
    } : p.table;
    return <ExpandableSection title={p.title} expanded={p.expanded} setExpanded={p.setExpanded}>
        <div className='inline'>
            <div className='search-container'>
                <p><span>{ stats.ped ? `Total value ${stats.ped} PED for` : 'Listing'}</span>
                    <span> {stats.count} </span>
                    <span> {stats.itemTypeName ?? 'item'}{stats.count == 1 ? '' : 's'}</span>
                </p>
                <p className='search-input-container'>
                    <SearchInput filter={p.filter} setFilter={p.setFilter} />
                </p>
            </div>
            <SortableFixedSizeTable1 data={table} />
        </div>
        <div className='inline'>
            { p.children }
        </div>
    </ExpandableSection>
}

const TradeItemDetails = () => {
    const tradeItemData = useSelector(getTradeItemData)
    const ttServiceItemValues = useSelector(getTTServiceItemValues)
    const dispatch = useDispatch()

    const favoriteTableData = tradeItemData?.c?.favoriteBlueprints?.length > 0 && calculate({
        allItems: tradeItemData.c.favoriteBlueprints,
        showItems: tradeItemData.c.favoriteBlueprints,
        sortSecuence: tradeItemData.sortSecuence.favoriteBlueprints,
        sortBy: sortTradeFavoriteBlueprintsBy,
        itemSelector: getTradeFavoriteBlueprintItem,
        tableData: getBlueprintsTableData('Favorite')
    })

    const ownedTableData = tradeItemData?.c?.ownedBlueprints?.length > 0 && calculate({
        allItems: tradeItemData.c.ownedBlueprints,
        showItems: tradeItemData.c.ownedBlueprints,
        sortSecuence: tradeItemData.sortSecuence.ownedBlueprints,
        sortBy: sortTradeOwnedBlueprintsBy,
        itemSelector: getTradeOwnedBlueprintItem,
        tableData: getBlueprintsTableData('Owned')
    })

    const otherTableData = tradeItemData?.c?.otherBlueprints?.length > 0 && calculate({
        allItems: tradeItemData.c.otherBlueprints,
        showItems: tradeItemData.c.otherBlueprints,
        sortSecuence: tradeItemData.sortSecuence.otherBlueprints,
        sortBy: sortTradeOtherBlueprintsBy,
        itemSelector: getTradeOtherBlueprintItem,
        tableData: getBlueprintsTableData('Not Owned')
    })

    if (favoriteTableData && ownedTableData)
    {
        const columnsWidth: number[] = favoriteTableData.columnsWidth.map((w, i) => Math.max(w, ownedTableData.columnsWidth[i]))
        favoriteTableData.columnsWidth = columnsWidth
        ownedTableData.columnsWidth = columnsWidth
    }

    return <>{ tradeItemData &&
        <div className='trade-item-data'>
            <h2 className='pointer img-hover' onClick={(e) => { e.stopPropagation(); dispatch(showTradingItemData(undefined)) }}>
                { tradeItemData.name }<img src='img/left.png' />
            </h2>
            { favoriteTableData ?
                <SortableFixedSizeTable data={favoriteTableData} /> :
                <p><strong>Not used on any Favorite Blueprint</strong></p>
            }
            { ownedTableData && <SortableFixedSizeTable data={ownedTableData} /> }
            { otherTableData && <SortableFixedSizeTable data={otherTableData} /> }
            { tradeItemData?.c?.loading && <p>Loading...</p> }
        </div>
    }</>
}

const InventoryVisibleList = () => {
    const inv = useSelector(getVisibleInventory)

    return <>
        <SortableTabularSection selector={INVENTORY_TABULAR_OWNED}>
            <TradeItemDetails />
        </SortableTabularSection>

        <MySortableTableSection
            title='Owned List'
            expanded={inv.originalList.expanded}
            filter={inv.filter}
            stats={inv.showList.stats}
            setExpanded={setVisibleInventoryExpanded}
            setFilter={setVisibleInventoryFilter}
            table={{
                allItems: inv.originalList.items,
                showItems: inv.showList.items,
                sortType: inv.showList.sortType,
                sortBy: sortVisibleBy,
                itemSelector: getVisibleInventoryItem,
                tableData
            }}
        >
            <TradeItemDetails />
        </MySortableTableSection>
    </>
}

export default InventoryVisibleList