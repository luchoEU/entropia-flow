import React from 'react'
import { hideByContainer, hideByName, hideByValue, setVisibleInventoryExpanded, setVisibleInventoryFilter, showTradingItemData, sortTradeBlueprintsBy, sortVisibleBy } from '../../application/actions/inventory'
import { CONTAINER, NAME, QUANTITY, sortColumnDefinition, TT_SERVICE_COLUMN, VALUE } from '../../application/helpers/inventory.sort'
import SortableTableSection, { TableData } from '../common/SortableTableSection'
import { SortableFixedSizeTable, TableData as TableData2 } from '../common/SortableTableSection2'
import { getTradeBlueprintItem, getTradeItemData, getVisibleInventory, getVisibleInventoryItem } from '../../application/selectors/inventory';
import { useDispatch, useSelector } from 'react-redux'
import { SHOW_TT_SERVICE } from '../../../config'
import { getTTServiceItemValues } from '../../application/selectors/ttService'
import { reloadTTService } from '../../application/actions/ttService'
import { ItemVisible, TradeBlueprintLineData } from '../../application/state/inventory'
import { CLICKS } from '../../application/helpers/craftSort'

const tableData: TableData<ItemVisible> = {
    columns: [NAME, QUANTITY, VALUE, CONTAINER],
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

const blueprintsTableData: TableData2<TradeBlueprintLineData> = {
    columns: 2,
    sortRow: [
        { justifyContent: 'center', text: 'Favorite Blueprint' }, // BP_NAME
        { justifyContent: 'end', text: 'Quantity per Click' },
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
}

const InventoryVisibleList = () => {
    const inv = useSelector(getVisibleInventory)
    const tradeItemData = useSelector(getTradeItemData)
    const ttServiceItemValues = useSelector(getTTServiceItemValues)
    const dispatch = useDispatch()

    return <>
        <SortableTableSection
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
        />
        { tradeItemData &&
            <div className='trade-item-data'>
                <h2 className='pointer img-hover' onClick={(e) => { e.stopPropagation(); dispatch(showTradingItemData(undefined)) }}>
                    { tradeItemData.name }<img src='img/left.png' />
                </h2>
                { tradeItemData.c?.blueprints &&
                    (tradeItemData.c.blueprints.length === 0 ?
                        <p><strong>Not used on Favorite Blueprints</strong></p> :
                        <SortableFixedSizeTable
                            data={{
                                allItems: tradeItemData.c.blueprints,
                                showItems: tradeItemData.c.blueprints,
                                sortType: tradeItemData.sortInfo.blueprints,
                                sortBy: sortTradeBlueprintsBy,
                                itemSelector: getTradeBlueprintItem,
                                tableData: blueprintsTableData
                            }}
                        />)
                }
            </div>
        }
    </>
}

export default InventoryVisibleList