import React from 'react'
import { setOwnedOptions, showAll, showHiddenItems, showTradingItemData, sortTradeFavoriteBlueprintsBy, sortTradeOtherBlueprintsBy, sortTradeOwnedBlueprintsBy } from '../../application/actions/inventory'
import { calculate, SortableFixedSizeTable, TableData as TableData2 } from '../common/SortableTableSection2'
import { getHideCriteria, getOwnedOptions, getTradeFavoriteBlueprintItem, getTradeItemDataChain, getTradeOtherBlueprintItem, getTradeOwnedBlueprintItem } from '../../application/selectors/inventory';
import { useDispatch, useSelector } from 'react-redux'
import { INVENTORY_TABULAR_OWNED, ItemOwned, TradeBlueprintLineData, TradeItemData } from '../../application/state/inventory'
import SortableTabularSection from '../common/SortableTabularSection'
import WebDataControl from '../common/WebDataControl';
import { loadItemUsageData, loadItemData, itemReserveValueChanged } from '../../application/actions/items';
import { ItemUsageWebData, ItemWebData } from '../../../web/state';
import { setBlueprintStared } from '../../application/actions/craft';
import { getItem } from '../../application/selectors/items';
import ItemInventory from '../item/ItemInventory';
import { addZeroes } from '../craft/CraftBlueprint';
import ItemNotes from '../item/ItemNotes';
import ItemMarkup from '../item/ItemMarkup';
import ItemCalculator from '../item/ItemCalculator';
import { getTabularData } from '../../application/selectors/tabular';
import { Field } from '../common/Field';
import { getTTService } from '../../application/selectors/ttService';
import { isFeatureEnabled } from '../../application/selectors/settings';
import { FEATURE_TT_SERVICE_RELOAD } from '../../application/state/settings';
import { loadTTService } from '../../application/actions/ttService';
import { TTServiceInventoryWebData } from '../../application/state/ttService';
import { RowValue } from '../common/SortableTabularSection.data';
import { NavigateFunction } from 'react-router-dom';
import { filterExact } from '../../../common/filter';
import { craftBlueprintUrl, navigateTo } from '../../application/actions/navigation';

const getBlueprintsTableData = (type: string, stared: boolean | undefined, addBpLink: boolean): TableData2<TradeBlueprintLineData> => ({
    sortRow: [
        { justifyContent: 'center', text: type + ' Blueprint' }, // BP_NAME
        { justifyContent: 'end', text: 'Quantity per Click' }, // QUANTITY
    ],
    getRow: (item: TradeBlueprintLineData) => ({
        columns: [
            { // BP_NAME
                style: { justifyContent: 'start' },
                sub: [
                    { itemText: item.bpName },
                    {
                        visible: stared !== undefined,
                        title: stared ? 'Remove from Favorites' : 'Add to Favorites',
                        imgButton: {
                            src: stared ? 'img/staron.png' : 'img/staroff.png',
                            dispatch: () => setBlueprintStared(item.bpName, !stared)
                        },
                    },
                    {
                        visible: addBpLink,
                        title: 'Open this blueprint',
                        imgButton: {
                            src: 'img/right.png',
                            dispatch: (n: NavigateFunction) => navigateTo(n, craftBlueprintUrl(item.bpName)),
                        },
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
    const tabularItems = useSelector(getTabularData(INVENTORY_TABULAR_OWNED)).items;
    if (!tradeItemDataChain)
        return <></> // no chain

    const chainRootName = tradeItemDataChain[0]?.name;
    if (!tabularItems?.show.find((d: ItemOwned) => d.data.n === chainRootName))
        return <></> // chain root is not visible

    return <>
        { tradeItemDataChain.map((tradeItemData, chainIndex) => {
            const chainNext = tradeItemDataChain.length > chainIndex + 1 && tradeItemDataChain[chainIndex + 1]?.name;
            return <div key={tradeItemData.name} className='trade-item-data'>
                <h2 className='pointer img-hover' onClick={(e) => { e.stopPropagation(); dispatch(showTradingItemData(chainNext ? tradeItemData.name : undefined, chainIndex)) }}>
                    { tradeItemData.name }<img src={chainNext ? 'img/right.png' : 'img/left.png'} />
                </h2>
                { !chainNext && <TradeItemDetails
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
    const item = useSelector(getItem(tradeItemData.name))
    const ttService = useSelector(getTTService)
    const showTTService = useSelector(isFeatureEnabled(FEATURE_TT_SERVICE_RELOAD));

    const { reserve } = useSelector(getOwnedOptions)

    const favoriteTableData = tradeItemData?.c?.favoriteBlueprints?.length > 0 && calculate({
        allItems: tradeItemData.c.favoriteBlueprints,
        showItems: tradeItemData.c.favoriteBlueprints,
        sortSecuence: tradeItemData.sortSecuence.favoriteBlueprints,
        sortBy: sortTradeFavoriteBlueprintsBy(chainIndex),
        itemSelector: getTradeFavoriteBlueprintItem(chainIndex),
        tableData: getBlueprintsTableData('Favorite', true, true)
    })

    const ownedTableData = tradeItemData?.c?.ownedBlueprints?.length > 0 && calculate({
        allItems: tradeItemData.c.ownedBlueprints,
        showItems: tradeItemData.c.ownedBlueprints,
        sortSecuence: tradeItemData.sortSecuence.ownedBlueprints,
        sortBy: sortTradeOwnedBlueprintsBy(chainIndex),
        itemSelector: getTradeOwnedBlueprintItem(chainIndex),
        tableData: getBlueprintsTableData('Owned', false, true)
    })

    const otherTableData = tradeItemData?.c?.otherBlueprints?.length > 0 && calculate({
        allItems: tradeItemData.c.otherBlueprints,
        showItems: tradeItemData.c.otherBlueprints,
        sortSecuence: tradeItemData.sortSecuence.otherBlueprints,
        sortBy: sortTradeOtherBlueprintsBy(chainIndex),
        itemSelector: getTradeOtherBlueprintItem(chainIndex),
        tableData: getBlueprintsTableData('Not Owned', undefined, false)
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
        <WebDataControl w={item?.web?.item} name='Basic Information' dispatchReload={() => loadItemData(tradeItemData.name)} content={(webItem: ItemWebData) =>
            <>
                <p>Type: { webItem.type }</p>
                <p>Value: { addZeroes(webItem.value) }</p>
                { reserve && <Field label='Reserve:' value={item.reserveAmount ?? ''} getChangeAction={itemReserveValueChanged(tradeItemData.name)}> PED (in TT value)</Field> }
                <ItemMarkup name={tradeItemData.name} />
                <ItemCalculator name={tradeItemData.name} />
            </>
        } />
        <ItemNotes name={tradeItemData.name} />
        { showTTService && <>
            <p style={{ height: '5px' }} />
            <WebDataControl w={ttService?.web?.inventory} name='TT Inventory' dispatchReload={loadTTService} content={(inventory: TTServiceInventoryWebData) => {
                const list = inventory.filter(d => d.name === tradeItemData.name)
                return list.length === 0 ?
                    <p><strong>No entries in TT Service Inventory</strong></p> :
                    <table style={{ marginBottom: '10px' }}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Player</th>
                                <th>Quantity</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            { list.map(d => (
                                <tr>
                                    <td>{d.date}</td>
                                    <td>{d.player}</td>
                                    <td>{d.quantity}</td>
                                    <td>{d.value.toFixed(2)}</td>
                                </tr>
                            )) }
                        </tbody>
                    </table>
            }} />
        </> }
        <p style={{ height: '5px' }} />
        <WebDataControl w={item?.web?.usage} name='Item Usage' dispatchReload={() => loadItemUsageData(tradeItemData.name)} content={(usage: ItemUsageWebData) =>
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
        <ItemInventory filter={filterExact(tradeItemData.name)} />
    </>
}

const _getSwitchButton = (button: string, description: string, enabled: boolean, dispatch: () => any): RowValue => ({
    button,
    class: `button-option-switch ${enabled ? 'active' : ''}`,
    title: `${description} ${enabled ? '[ON]': '[OFF]'}, click to ${enabled ? 'dis' : 'en'}able it}`,
    dispatch
})

const InventoryVisibleList = () => {
    const c = useSelector(getHideCriteria)
    const opt = useSelector(getOwnedOptions)
    const hasAnyHideCriteria = c.name.length > 0 || c.container.length > 0 || c.value >= 0
    return <SortableTabularSection
        selector={INVENTORY_TABULAR_OWNED}
        afterSearch={ hasAnyHideCriteria && [
            c.show && { button: 'Unhide All', class: 'show-all', title: 'Clear all hide filters and show all items', dispatch: showAll },
            {
                img: c.show ? 'img/eyeClose.png' : 'img/eyeOpen.png',
                class: 'img-hidden',
                title: `click to ${c.show ? 'Show':'Hide'} Hidden items`,
                dispatch: () => showHiddenItems(!c.show)
            }
        ]}
        beforeTable={[
            { flex: 1 },
            _getSwitchButton('R', 'Add Reserve to items', opt.reserve, () => setOwnedOptions({ reserve: !opt.reserve })),
            _getSwitchButton('A', 'Hide items on auction', opt.auction, () => setOwnedOptions({ auction: !opt.auction })),
        ]}
    >
        <TradeItemDetailsChain />
    </SortableTabularSection>
}

export default InventoryVisibleList
