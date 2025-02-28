import React from 'react'
import { showTradingItemData, sortTradeFavoriteBlueprintsBy, sortTradeOtherBlueprintsBy, sortTradeOwnedBlueprintsBy } from '../../application/actions/inventory'
import { calculate, SortableFixedSizeTable, TableData as TableData2 } from '../common/SortableTableSection2'
import { getTradeFavoriteBlueprintItem, getTradeItemData, getTradeOtherBlueprintItem, getTradeOwnedBlueprintItem } from '../../application/selectors/inventory';
import { useDispatch, useSelector } from 'react-redux'
import { getTTServiceItemValues } from '../../application/selectors/ttService'
import { INVENTORY_TABULAR_OWNED, TradeBlueprintLineData } from '../../application/state/inventory'
import SortableTabularSection from '../common/SortableTabularSection'

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
        let columnsWidth: number[] = favoriteTableData.columnsWidth.map((w, i) => Math.max(w, ownedTableData.columnsWidth[i]))
        if (otherTableData) {
            columnsWidth = columnsWidth.map((w, i) => Math.max(w, otherTableData.columnsWidth[i]))
            otherTableData.columnsWidth = columnsWidth
        }
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

const InventoryVisibleList = () =>
    <SortableTabularSection selector={INVENTORY_TABULAR_OWNED}>
        <TradeItemDetails />
    </SortableTabularSection>

export default InventoryVisibleList