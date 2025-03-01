import React from 'react'
import { showTradingItemData, sortTradeFavoriteBlueprintsBy, sortTradeOtherBlueprintsBy, sortTradeOwnedBlueprintsBy } from '../../application/actions/inventory'
import { calculate, SortableFixedSizeTable, TableData as TableData2 } from '../common/SortableTableSection2'
import { getTradeFavoriteBlueprintItem, getTradeItemDataChain, getTradeOtherBlueprintItem, getTradeOwnedBlueprintItem } from '../../application/selectors/inventory';
import { useDispatch, useSelector } from 'react-redux'
import { getTTServiceItemValues } from '../../application/selectors/ttService'
import { INVENTORY_TABULAR_OWNED, TradeBlueprintLineData } from '../../application/state/inventory'
import SortableTabularSection from '../common/SortableTabularSection'
import WebDataControl from '../common/WebDataControl';
import { loadItemUsageData } from '../../application/actions/materials';
import { ItemUsageWebData } from '../../../web/state';

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
    const tradeItemDataChain = useSelector(getTradeItemDataChain)
    const ttServiceItemValues = useSelector(getTTServiceItemValues)
    const dispatch = useDispatch()

    return <>{ tradeItemDataChain?.map((tradeItemData, chainIndex) => {
        const chainNext = tradeItemDataChain.length > chainIndex + 1 && tradeItemDataChain[chainIndex + 1]?.name

        const favoriteTableData = tradeItemData?.c?.favoriteBlueprints?.length > 0 && calculate({
            allItems: tradeItemData.c.favoriteBlueprints,
            showItems: tradeItemData.c.favoriteBlueprints,
            sortSecuence: tradeItemData.sortSecuence.favoriteBlueprints,
            sortBy: sortTradeFavoriteBlueprintsBy(chainIndex),
            itemSelector: getTradeFavoriteBlueprintItem(chainIndex),
            tableData: getBlueprintsTableData('Favorite')
        })
    
        const ownedTableData = tradeItemData?.c?.ownedBlueprints?.length > 0 && calculate({
            allItems: tradeItemData.c.ownedBlueprints,
            showItems: tradeItemData.c.ownedBlueprints,
            sortSecuence: tradeItemData.sortSecuence.ownedBlueprints,
            sortBy: sortTradeOwnedBlueprintsBy(chainIndex),
            itemSelector: getTradeOwnedBlueprintItem(chainIndex),
            tableData: getBlueprintsTableData('Owned')
        })
    
        const otherTableData = tradeItemData?.c?.otherBlueprints?.length > 0 && calculate({
            allItems: tradeItemData.c.otherBlueprints,
            showItems: tradeItemData.c.otherBlueprints,
            sortSecuence: tradeItemData.sortSecuence.otherBlueprints,
            sortBy: sortTradeOtherBlueprintsBy(chainIndex),
            itemSelector: getTradeOtherBlueprintItem(chainIndex),
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

        return <div key={tradeItemData.name} className='trade-item-data'>
            <h2 className='pointer img-hover' onClick={(e) => { e.stopPropagation(); dispatch(showTradingItemData(undefined, chainIndex)) }}>
                { tradeItemData.name }<img src='img/left.png' />
            </h2>
            <WebDataControl w={tradeItemData.c?.usage} dispatchReload={() => loadItemUsageData(tradeItemData.name)} content={(usage: ItemUsageWebData) =>
                <>
                    { favoriteTableData ?
                        <SortableFixedSizeTable data={favoriteTableData} /> :
                        <p><strong>Not used on any {ownedTableData ? 'Favorite' : 'Owned'} Blueprint</strong></p>
                    }
                    { ownedTableData && <SortableFixedSizeTable data={ownedTableData} /> }
                    { otherTableData && <SortableFixedSizeTable data={otherTableData} /> }

                    { usage.refinings?.length > 0 && 
                        <table style={{ marginBottom: '10px' }}>
                            <thead>
                                <tr>
                                    <th>Refined Material</th>
                                    <th>Quantity Required</th>
                                </tr>
                            </thead>
                            <tbody>
                                { usage.refinings.map(rm => (
                                    <tr key={rm.product.name} className='item-row stable pointer' onClick={(e) => {
                                        e.stopPropagation();
                                        dispatch(showTradingItemData(chainNext === rm.product.name ? undefined : rm.product.name, chainIndex + 1))
                                    }}>
                                        <td data-text={rm.product.name}>
                                            {rm.product.name}
                                            <img src={chainNext === rm.product.name ? 'img/left.png' : 'img/right.png'}/>
                                        </td>
                                        <td align='center'>{rm.product.quantity}</td>
                                    </tr>
                                )) }
                            </tbody>
                        </table>
                    }
                </>
            } />
        </div>
    })}
    </>
}

const InventoryVisibleList = () =>
    <SortableTabularSection selector={INVENTORY_TABULAR_OWNED}>
        <TradeItemDetails />
    </SortableTabularSection>

export default InventoryVisibleList