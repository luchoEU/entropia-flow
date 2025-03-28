import React from 'react'
import { showTradingItemData, sortTradeFavoriteBlueprintsBy, sortTradeOtherBlueprintsBy, sortTradeOwnedBlueprintsBy } from '../../application/actions/inventory'
import { calculate, SortableFixedSizeTable, TableData as TableData2 } from '../common/SortableTableSection2'
import { getTradeFavoriteBlueprintItem, getTradeItemDataChain, getTradeOtherBlueprintItem, getTradeOwnedBlueprintItem } from '../../application/selectors/inventory';
import { useDispatch, useSelector } from 'react-redux'
import { INVENTORY_TABULAR_OWNED, TradeBlueprintLineData, TradeItemData } from '../../application/state/inventory'
import SortableTabularSection from '../common/SortableTabularSection'
import WebDataControl from '../common/WebDataControl';
import { loadItemUsageData, loadMaterialData, materialNotesValueChanged } from '../../application/actions/materials';
import { ItemUsageWebData, MaterialWebData } from '../../../web/state';
import { setBlueprintActivePage } from '../../application/actions/craft';
import { CRAFT_PAGE, selectMenu } from '../../application/actions/menu';
import { FieldArea } from '../common/Field';
import { getMaterial } from '../../application/selectors/materials';
import MaterialInventory from '../material/MaterialInventory';
import { addZeroes } from '../craft/CraftExpandedList';
import MaterialNotes from '../material/MaterialNotes';
import MaterialMarkup from '../material/MaterialMarkup';
import MaterialCalculator from '../material/MaterialCalculator';

const getBlueprintsTableData = (type: string, addBpLink: boolean): TableData2<TradeBlueprintLineData> => ({
    sortRow: [
        { justifyContent: 'center', text: type + ' Blueprint' }, // BP_NAME
        { justifyContent: 'end', text: 'Quantity per Click' }, // QUANTITY
    ],
    getRow: (item: TradeBlueprintLineData) => ({
        columns: [
            { // BP_NAME
                style: { justifyContent: 'start' },
                dispatch: () => [ selectMenu(CRAFT_PAGE), setBlueprintActivePage(item.bpName) ],
                sub: [
                    { itemText: item.bpName },
                    { visible: addBpLink,
                        title: 'Open this blueprint',
                        img: { src: 'img/right.png' }
                    }
                ]
            },
            { // QUANTITY
                style: { justifyContent: 'center' },
                sub: [{ itemText: item.quantity?.toString() }]
            }
        ]
    })
})

const TradeItemDetailsChain = () => {
    const dispatch = useDispatch()
    const tradeItemDataChain = useSelector(getTradeItemDataChain)

    return <>
        { tradeItemDataChain?.map((tradeItemData, chainIndex) => {
            const chainNext = tradeItemDataChain.length > chainIndex + 1 && tradeItemDataChain[chainIndex + 1]?.name;
            return <div key={tradeItemData.name} className='trade-item-data'>
                <h2 className='pointer img-hover' onClick={(e) => { e.stopPropagation(); dispatch(showTradingItemData(chainNext ? tradeItemData.name : undefined, chainIndex)) }}>
                    { tradeItemData.name }<img src={chainNext ? 'img/right.png' : 'img/left.png'} />
                </h2>
                { !chainNext &&
                    <TradeItemDetails
                    key={tradeItemData.name}
                    tradeItemData={tradeItemData}
                    chainIndex={chainIndex}
                    chainNext={chainNext}
                /> }
            </div>
        })}
    </>
}

const TradeItemDetails = ({ tradeItemData, chainIndex, chainNext }: { tradeItemData: TradeItemData, chainIndex: number, chainNext: string }) => {
    const dispatch = useDispatch()
    const material = useSelector(getMaterial(tradeItemData.name))

    const favoriteTableData = tradeItemData?.c?.favoriteBlueprints?.length > 0 && calculate({
        allItems: tradeItemData.c.favoriteBlueprints,
        showItems: tradeItemData.c.favoriteBlueprints,
        sortSecuence: tradeItemData.sortSecuence.favoriteBlueprints,
        sortBy: sortTradeFavoriteBlueprintsBy(chainIndex),
        itemSelector: getTradeFavoriteBlueprintItem(chainIndex),
        tableData: getBlueprintsTableData('Favorite', true)
    })

    const ownedTableData = tradeItemData?.c?.ownedBlueprints?.length > 0 && calculate({
        allItems: tradeItemData.c.ownedBlueprints,
        showItems: tradeItemData.c.ownedBlueprints,
        sortSecuence: tradeItemData.sortSecuence.ownedBlueprints,
        sortBy: sortTradeOwnedBlueprintsBy(chainIndex),
        itemSelector: getTradeOwnedBlueprintItem(chainIndex),
        tableData: getBlueprintsTableData('Owned', true)
    })

    const otherTableData = tradeItemData?.c?.otherBlueprints?.length > 0 && calculate({
        allItems: tradeItemData.c.otherBlueprints,
        showItems: tradeItemData.c.otherBlueprints,
        sortSecuence: tradeItemData.sortSecuence.otherBlueprints,
        sortBy: sortTradeOtherBlueprintsBy(chainIndex),
        itemSelector: getTradeOtherBlueprintItem(chainIndex),
        tableData: getBlueprintsTableData('Not Owned', false)
    })

    let columnsWidth: number[] = favoriteTableData?.columnsWidth
    if (ownedTableData) {
        columnsWidth = columnsWidth?.map((w, i) => Math.max(w, ownedTableData.columnsWidth[i])) ?? ownedTableData.columnsWidth
    }
    if (columnsWidth && otherTableData) {
        columnsWidth = columnsWidth.map((w, i) => Math.max(w, otherTableData.columnsWidth[i]))
        otherTableData.columnsWidth = columnsWidth
    }
    if (favoriteTableData)
        favoriteTableData.columnsWidth = columnsWidth
    if (ownedTableData)
        ownedTableData.columnsWidth = columnsWidth

    return <>
        <WebDataControl w={material?.web?.material} dispatchReload={() => loadMaterialData(tradeItemData.name)} content={(material: MaterialWebData) =>
            <>
                <p>Type: { material.type }</p>
                <p>Value: { addZeroes(material.value) }</p>
                <MaterialMarkup name={tradeItemData.name} />
                <MaterialCalculator name={tradeItemData.name} />
            </>
        } />
        <MaterialNotes name={tradeItemData.name} />
        <WebDataControl w={material?.web?.usage} dispatchReload={() => loadItemUsageData(tradeItemData.name)} content={(usage: ItemUsageWebData) =>
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
        <MaterialInventory />
    </>
}

const InventoryVisibleList = () =>
    <SortableTabularSection selector={INVENTORY_TABULAR_OWNED}>
        <TradeItemDetailsChain />
    </SortableTabularSection>

export default InventoryVisibleList
