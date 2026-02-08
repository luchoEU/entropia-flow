import React, { useMemo, useEffect } from 'react'
import { useAtomValue, useSetAtom, atom } from 'jotai'
import { ItemOwned, TradeItemData } from '../../application/state/inventory'
import { JotaiWebDataControl } from '../common/JotaiWebDataControl';
import { ItemUsageWebData, ItemWebData } from '../../../web/state';
import ItemInventory from '../item/ItemInventory';
import { addZeroes } from '../craft/CraftBlueprint';
import ItemNotes from '../item/ItemNotes';
import ItemMarkup from '../item/ItemMarkup';
import ItemCalculator from '../item/ItemCalculator';
import ItemSyncStatus from '../item/ItemSyncStatus';
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
  getItemUsageWebAtom,
  filterOptionsAtom,
  setTradeItemChainAtom,
  setMaterialValueAtom,
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
  getItemWebAtom,
  loadItemUsageWebAtom,
  loadItemWebAtom,
  getTTServiceWebAtom,
} from '../../application/atoms/inventory'
import { setItemReserveAmountAtom } from '../../application/atoms/items'
import ExpandableSection from '../common/ExpandableSection';
import { isFeatureEnabledAtom } from '../../application/atoms/settings';

const RefiningTableSection = React.memo(({ refinings, chainNext, chainIndex, setTradeItemChain }: {
  refinings: any[]
  chainNext: string | undefined
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
            const chainNext = tradeItemDataChain.length > chainIndex + 1 ? tradeItemDataChain[chainIndex + 1]?.name : undefined;
            const editMode = tradeItemData.name ? tradeItemData.name === matEditModeMaterialName : false
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

const TradeItemDetails = ({ tradeItemData, chainIndex, chainNext }:
     { tradeItemData: TradeItemData, chainIndex: number, chainNext: string | undefined}
) => {
    const setMaterialValue = useSetAtom(setMaterialValueAtom)
    const setMaterialType = useSetAtom(setMaterialTypeAtom)
    const setReserveAmount = useSetAtom(setItemReserveAmountAtom)
    const setTradeItemChain = useSetAtom(setTradeItemChainAtom)
    const mat = useAtomValue(itemsStateAtom)
    const { reserve } = useAtomValue(filterOptionsAtom)

    const name = tradeItemData.name
    if (!name) return <></> // Guard against undefined name

    const editMode = name && name === mat.editModeMaterialName

    const itemAtom = useMemo(() => getItemAtom(name), [name])
    const featureEnabledAtom = useMemo(() => isFeatureEnabledAtom(Feature.ttService), [])

    // Read values from atoms
    const item = useAtomValue(itemAtom)
    const showTTService = useAtomValue(featureEnabledAtom)

    // Create atoms for lazy-loaded blueprint tables
    const favoriteAtom = useMemo(() => getFavoriteBlueprintsAtom(name), [name])
    const ownedAtom = useMemo(() => getOwnedBlueprintsAtom(name), [name])
    const otherAtom = useMemo(() => getOtherBlueprintsAtom(name), [name])

    // Read blueprint data to check if empty
    const favoriteBlueprints = useAtomValue(favoriteAtom)
    const ownedBlueprints = useAtomValue(ownedAtom)
    const otherBlueprints = useAtomValue(otherAtom)

    return <>
        {<JotaiWebDataControl valueGet={getItemWebAtom} loadGet={loadItemWebAtom} itemName={name} name='Basic Information' showWithErrors={true} content={(webItem: ItemWebData | undefined) => {
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
                        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.85em', color: '#999', marginLeft: '15px' }}>{` PED (in TT value)${(user?.value ?? webItem?.value) ? `, quantity ${(Number(item.reserveAmount ?? 0) / (user?.value ?? webItem?.value ?? 0)).toFixed(0)}` : ''}`}</span>
                            <ItemSyncStatus />
                        </span>
                    </Field>
                </div> }
                <div style={{ borderTop: '1px solid #ddd', marginTop: '12px' }}>
                    <ItemMarkup name={tradeItemData.name} />
                    {<div style={{ marginTop: '12px' }}>
                        <ItemCalculator name={tradeItemData.name} />
                    </div>}
                </div>
            </>
        }} />}
        <ItemNotes name={tradeItemData.name} />
        { showTTService && <>
            <p style={{ height: '5px' }} />
            <JotaiWebDataControl valueGet={getTTServiceWebAtom} loadGet={() => loadTTServiceAtom} itemName={tradeItemData.name} name='TT Inventory' content={(inventory: TTServiceInventoryWebData | undefined) => {
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
        <JotaiWebDataControl valueGet={getItemUsageWebAtom} loadGet={loadItemUsageWebAtom} itemName={tradeItemData.name} name='Item Usage' content={(usage: ItemUsageWebData | undefined) => {
            if (!usage) return <></>
            return <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '14px' }}>
                <div>
                    { favoriteBlueprints.length > 0 ?
                        <JotaiSortableTable
                            itemsAtom={favoriteAtom}
                            config={createBlueprintTableConfig('Favorite', true, tradeItemData.name)}
                            useFixedSizeList={false}
                        /> :
                        <p style={{ color: '#666' }}>Not used on any {ownedBlueprints.length > 0 ? 'Favorite' : 'Owned'} Blueprint</p>
                    }
                </div>
                { ownedBlueprints.length > 0 && <div>
                    <JotaiSortableTable
                        itemsAtom={ownedAtom}
                        config={createBlueprintTableConfig('Owned', false, tradeItemData.name)}
                        useFixedSizeList={false}
                    />
                </div> }
                { otherBlueprints.length > 0 && <div>
                    <JotaiSortableTable
                        itemsAtom={otherAtom}
                        config={createBlueprintTableConfig('Not Owned', undefined, tradeItemData.name)}
                        useFixedSizeList={false}
                    />
                </div> }

                { usage.refinings && usage.refinings.length > 0 && <RefiningTableSection
                    refinings={usage.refinings}
                    chainNext={chainNext}
                    chainIndex={chainIndex}
                    setTradeItemChain={setTradeItemChain}
                />}
            </div>
        }} />
        <ItemInventory />
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
