import React from 'react'
import { useAtomValue, useSetAtom, atom } from 'jotai'
import { ItemOwned, TradeItemData } from '../../application/state/inventory'
import { JotaiWebDataControl } from '../common/JotaiWebDataControl';
import { ItemWebData, RefiningWebData } from '../../../web/state';
import ItemInventory from '../item/ItemInventory';
import { addZeroes } from '../craft/CraftBlueprint';
import ItemNotes from '../item/ItemNotes';
import ItemMarkup from '../item/ItemMarkup';
import ItemCalculator from '../item/ItemCalculator';
import { Field } from '../common/Field';
import { TTServiceInventoryWebData } from '../../application/state/ttService';
import { filterExact } from '../../../common/filter';
import { Feature } from '../../application/state/settings';
import AutocompleteInput from '../common/AutocompleteInput';
import ImgButton from '../common/ImgButton';
import { JotaiSortableTable } from '../common/jotai/JotaiSortableTable'
import {
  enrichedItemsAtom,
  getInventoryColumnConfig,
  InventoryOwnedListAfterSearch,
  InventoryOwnedListBeforeTable,
  tradeItemChainAtom,
  itemsStateAtom,
  getItemAtom,
  getItemWebLoadableAtom,
  getItemUsageWebAtom,
  loadItemUsageDataAtom,
  getTTServiceLoadableAtom,
  filterOptionsAtom,
  setTradeItemChainAtom,
  setMaterialValueAtom,
  setReserveAmountAtom,
  setMaterialTypeAtom,
  setEditModeMaterialNameAtom,
  editModeMaterialNameAtom,
  createBlueprintTableConfig,
  createRefiningTableConfig,
  createTTServiceTableConfig,
  getFavoriteBlueprintsAtom,
  getOwnedBlueprintsAtom,
  getOtherBlueprintsAtom,
  loadTTServiceAtom,
} from '../../application/atoms/inventory'
import ExpandableSection from '../common/ExpandableSection2';
import { isFeatureEnabledAtom } from '../../application/atoms/settings';

const RefiningTableSection = React.memo(({ refinings, chainNext, chainIndex, setTradeItemChain }: {
  refinings: any[]
  chainNext: string
  chainIndex: number
  setTradeItemChain: any
}) => {
  const refiningAtom = React.useMemo(() =>
    atom(refinings.map((rm: any) => ({
      ...rm,
      isSelected: chainNext === rm.product.name
    })))
  , [refinings, chainNext])

  return (
    <div style={{ borderTop: '1px solid #ddd', paddingTop: '12px' }}>
      <JotaiSortableTable
        itemsAtom={refiningAtom}
        config={createRefiningTableConfig((productName) => {
          setTradeItemChain(chainNext === productName ? undefined : productName, chainIndex + 1)
        })}
        useFixedSizeList={false}
      />
    </div>
  )
})

const TradeItemDetailsChain = () => {
    const setTradeItemChain = useSetAtom(setTradeItemChainAtom)
    const setEditModeMaterialName = useSetAtom(setEditModeMaterialNameAtom)
    const tradeItemDataChain = useAtomValue(tradeItemChainAtom)
    const matEditModeMaterialName = useAtomValue(editModeMaterialNameAtom)
    const enrichedItems = useAtomValue(enrichedItemsAtom)

    if (!tradeItemDataChain)
        return <></> // no chain

    const chainRootName = tradeItemDataChain[0]?.name;
    if (!enrichedItems?.find((d: ItemOwned) => d.data.n === chainRootName))
        return <></> // chain root is not visible

    return <>
        { tradeItemDataChain.map((tradeItemData, chainIndex) => {
            const chainNext = tradeItemDataChain.length > chainIndex + 1 && tradeItemDataChain[chainIndex + 1]?.name;
            const editMode = tradeItemData.name && tradeItemData.name === matEditModeMaterialName
            return <div key={tradeItemData.name} className='trade-item-data'>
                <h2 className='pointer img-hover-container' onClick={(e) => { e.stopPropagation(); setTradeItemChain(chainNext ? tradeItemData.name : undefined, chainIndex) }}>
                    { tradeItemData.name }<img src={chainNext ? 'img/right.png' : 'img/left.png'} />
                    { tradeItemData.name && <ImgButton src='img/edit.png' show={editMode} title={editMode ? 'Finish edit' : 'Edit Material'} dispatch={() => setEditModeMaterialName(editMode ? undefined : tradeItemData.name)}/> }
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
    const setMaterialValue = useSetAtom(setMaterialValueAtom)
    const setMaterialType = useSetAtom(setMaterialTypeAtom)
    const setReserveAmount = useSetAtom(setReserveAmountAtom)
    const setTradeItemChain = useSetAtom(setTradeItemChainAtom)
    const loadTTService = useSetAtom(loadTTServiceAtom)
    const mat = useAtomValue(itemsStateAtom)
    const { reserve } = useAtomValue(filterOptionsAtom)

    const name = tradeItemData.name
    const editMode = name && name === mat.editModeMaterialName

    // Memoize atom factory calls to prevent new atoms on every render
    const itemAtom = React.useMemo(() => getItemAtom(name), [name])
    const featureEnabledAtom = React.useMemo(() => isFeatureEnabledAtom(Feature.ttService), [])
    const itemWebLoadableAtom = React.useMemo(() => getItemWebLoadableAtom(name), [name])
    const itemUsageAtom = React.useMemo(() => getItemUsageWebAtom(name), [name])
    const ttServiceLoadableAtom = React.useMemo(() => getTTServiceLoadableAtom(), [])

    // Read values from atoms
    const item = useAtomValue(itemAtom)
    const showTTService = useAtomValue(featureEnabledAtom)
    const usage = useAtomValue(itemUsageAtom)
    const loadItemUsage = useSetAtom(loadItemUsageDataAtom)

    // Load usage data on mount or when item name changes
    React.useEffect(() => {
      loadItemUsage(name)
    }, [name, loadItemUsage])

    // Create atoms for lazy-loaded blueprint tables
    const favoriteAtom = React.useMemo(() => getFavoriteBlueprintsAtom(name), [name])
    const ownedAtom = React.useMemo(() => getOwnedBlueprintsAtom(name), [name])
    const otherAtom = React.useMemo(() => getOtherBlueprintsAtom(name), [name])

    // Read blueprint data to check if empty
    const favoriteBlueprints = useAtomValue(favoriteAtom)
    const ownedBlueprints = useAtomValue(ownedAtom)
    const otherBlueprints = useAtomValue(otherAtom)
    return <>
        <JotaiWebDataControl loadableAtom={itemWebLoadableAtom} name='Basic Information' showWithErrors={true} content={(webItem: ItemWebData | undefined) => {
            const user = mat.map[name]?.user
            return <>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px 20px', marginBottom: '15px' }}>
                    <div>
                        <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '4px', fontWeight: '500' }}>Type</div>
                        { editMode ?
                            <AutocompleteInput value={user?.type?.toString() ?? ''} getChangeAction={(v) => setMaterialType(name, v)} suggestions={user?.suggestedTypes ?? []}/>
                            : (user ?? webItem) &&
                            <div style={{ fontSize: '1em' }}>{ user?.type ?? webItem?.type }</div>
                        }
                    </div>
                    <div>
                        <div style={{ fontSize: '0.85em', color: '#666', marginBottom: '4px', fontWeight: '500' }}>Value</div>
                        { editMode ?
                            <input type='text' value={user?.valueOnEdit} onChange={(e) => setMaterialValue(name, e.target.value)} style={{ width: '100%' }}/>
                            : (user ?? webItem) &&
                            <div style={{ fontSize: '1em' }}>{ addZeroes(user?.value ?? webItem?.value ?? 0) }</div>
                        }
                    </div>
                </div>
                { reserve && item && <div style={{ borderTop: '1px solid #ddd', marginBottom: '12px' }}>
                    <Field label='Reserve:' value={item.reserveAmount ?? ''} getChangeAction={(v) => setReserveAmount(tradeItemData.name, v)}>
                        <span style={{ fontSize: '0.85em', color: '#999', marginLeft: '15px' }}>{` PED (in TT value)${(user?.value ?? webItem?.value) ? `, quantity ${(Number(item.reserveAmount ?? 0) / (user?.value ?? webItem?.value ?? 0)).toFixed(0)}` : ''}`}</span>
                    </Field>
                </div> }
                <div style={{ borderTop: '1px solid #ddd', marginTop: '12px' }}>
                    <ItemMarkup name={tradeItemData.name} />
                    <div style={{ marginTop: '12px' }}>
                        <ItemCalculator name={tradeItemData.name} />
                    </div>
                </div>
            </>
        }} />
        <ItemNotes name={tradeItemData.name} />
        { showTTService && <>
            <p style={{ height: '5px' }} />
            <JotaiWebDataControl loadableAtom={ttServiceLoadableAtom} name='TT Inventory' onReload={loadTTService} content={(inventory: TTServiceInventoryWebData | undefined) => {
                const list = React.useMemo(() => inventory?.filter(d => d.name === tradeItemData.name), [inventory, tradeItemData.name])
                const ttServiceAtom = React.useMemo(() => atom(list ?? []), [list])
                return list?.length === 0 ?
                    <p><strong>No entries in TT Service Inventory</strong></p> :
                    <JotaiSortableTable
                        itemsAtom={ttServiceAtom}
                        config={createTTServiceTableConfig()}
                        useFixedSizeList={false}
                    />
            }} />
        </> }
        <p style={{ height: '5px' }} />
        {usage?.data?.value && <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '14px' }}>
                <div>
                    { favoriteBlueprints.length > 0 ?
                        <JotaiSortableTable
                            itemsAtom={favoriteAtom}
                            config={createBlueprintTableConfig('Favorite', true)}
                            useFixedSizeList={false}
                        /> :
                        <p style={{ color: '#666' }}>Not used on any {ownedBlueprints.length > 0 ? 'Favorite' : 'Owned'} Blueprint</p>
                    }
                </div>
                { ownedBlueprints.length > 0 && <div>
                    <JotaiSortableTable
                        itemsAtom={ownedAtom}
                        config={createBlueprintTableConfig('Owned', false)}
                        useFixedSizeList={false}
                    />
                </div> }
                { otherBlueprints.length > 0 && <div>
                    <JotaiSortableTable
                        itemsAtom={otherAtom}
                        config={createBlueprintTableConfig('Not Owned', undefined)}
                        useFixedSizeList={false}
                    />
                </div> }

                { usage.data.value.refinings && usage.data.value.refinings.length > 0 && <RefiningTableSection
                    refinings={usage.data.value.refinings}
                    chainNext={chainNext}
                    chainIndex={chainIndex}
                    setTradeItemChain={setTradeItemChain}
                />}
            </div>
        }
        <ItemInventory filter={filterExact(tradeItemData.name)} />
    </>
}

export const InventoryOwnedList = () => {
    const tradeItemChain = useAtomValue(tradeItemChainAtom)
    const isShowingTradeItem = !!tradeItemChain
    const filterOptions = useAtomValue(filterOptionsAtom)

    const config = React.useMemo(
        () => getInventoryColumnConfig(isShowingTradeItem, filterOptions.reserve),
        [isShowingTradeItem, filterOptions.reserve]
    )

    return <ExpandableSection selector='TradePage.OwnedList' title='Owned List' subtitle='List of the Items you own, excluding hidden ones'>
        <JotaiSortableTable<ItemOwned>
            itemsAtom={enrichedItemsAtom}
            config={config}
            afterSearch={<InventoryOwnedListAfterSearch />}
            beforeTable={<InventoryOwnedListBeforeTable />}
        >
            <TradeItemDetailsChain />
        </JotaiSortableTable>
    </ExpandableSection>
}
