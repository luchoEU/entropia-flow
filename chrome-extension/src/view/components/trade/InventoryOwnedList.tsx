import React, { useMemo } from 'react'
import { useAtomValue, useSetAtom, atom } from 'jotai'
import { ItemOwned, TradeItemData } from '../../application/state/inventory'
import { ItemUsageWebData, ItemWebData, RefiningWebData } from '../../../web/state';
import ItemInventory from '../item/ItemInventory';
import { addZeroes } from '../craft/CraftBlueprint';
import ItemNotes from '../item/ItemNotes';
import ItemMarkup from '../item/ItemMarkup';
import ItemCalculator from '../item/ItemCalculator';
import { Field } from '../common/Field';
import { CollapsibleTradeItemDetailsWebDataControl } from '../common/JotaiWebDataControl';
import { TTServiceInventoryWebData } from '../../application/state/ttService';
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
  filterOptionsAtom,
  setTradeItemChainAtom,
  setMaterialValueAtom,
  setMaterialTypeAtom,
  setEditModeMaterialNameAtom,
  createBlueprintTableConfig,
  createRefiningTableConfig,
  createTTServiceTableConfig,
  loadTTServiceAtom,
  getTTServiceWebAtom,
  hideCriteriaAtom,
} from '../../application/atoms/inventory'
import { parseAggregatedName } from '../../application/helpers/inventory'
import {
  setItemReserveAmountAtom,
  getItemAtom,
  itemsStateAtom,
  editModeMaterialNameAtom,
  getItemUsageWebAtom,
  getItemWebAtom,
  loadItemUsageWebAtom,
  loadItemWebAtom,
  getFavoriteBlueprintsAtom,
  getOwnedBlueprintsAtom,
  getOtherBlueprintsAtom
} from '../../application/atoms/items'
import { isFeatureEnabledAtom } from '../../application/atoms/settings';
import { JotaiSortableTableSection } from '../common/jotai/JotaiSortableTableSection';
import { useNavigate } from 'react-router-dom';
import { formatToUrl } from '../../application/helpers/navigation';
import { TabId } from '../../application/state/navigation';
import { blueprintsAtom, setBlueprintStaredAtom, staredAtom } from '../../application/atoms/craft';

const RefiningTableSection = React.memo(({ refinings, chainNext, chainIndex, ingredientName }: {
  refinings: RefiningWebData[]
  chainNext: string | undefined
  chainIndex: number
  ingredientName: string
}) => {
  const refiningAtom = React.useMemo(() => atom(refinings), [refinings])
  return (
    <div style={{ borderTop: '1px solid #ddd', paddingTop: '12px' }}>
      <JotaiSortableTable
        itemsAtom={refiningAtom}
        config={createRefiningTableConfig(chainNext, chainIndex, ingredientName)}
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
    const baseChainRootName = parseAggregatedName(chainRootName).baseName
    if (!enrichedItems?.find((d: ItemOwned) => d.data.n === chainRootName || d.data.n === baseChainRootName))
        return <></> // chain root is not visible

    return <div style={{ display: 'flex', flexDirection: 'column' }}>
        { tradeItemDataChain.map((tradeItemData, chainIndex) => {
            const chainNext = tradeItemDataChain.length > chainIndex + 1 ? tradeItemDataChain[chainIndex + 1]?.name : undefined;
            const editMode = tradeItemData.name ? tradeItemData.name === matEditModeMaterialName : false
            return <div key={tradeItemData.name} className='trade-item-data'>
                <h2 className='pointer img-hover-container' onClick={(e) => { e.stopPropagation(); setTradeItemChain(chainNext ? tradeItemData.name : undefined, chainIndex) }}>
                    { tradeItemData.name }<img src={chainNext ? 'img/right.png' : 'img/left.png'} />
                    { tradeItemData.name && !chainNext && <ImgButton src='img/edit.png' show={editMode} title={editMode ? 'Finish edit' : 'Edit Material'} action={() => setEditModeMaterialName(editMode ? undefined : tradeItemData.name)}/> }
                </h2>
                { !chainNext && <TradeItemDetails
                    key={tradeItemData.name}
                    tradeItemData={tradeItemData}
                    chainIndex={chainIndex}
                    chainNext={chainNext}
                /> }
            </div>
        })}
    </div>
}

const TradeItemDetails = ({ tradeItemData, chainIndex, chainNext }:
     { tradeItemData: TradeItemData, chainIndex: number, chainNext: string | undefined}
) => {
    const setMaterialValue = useSetAtom(setMaterialValueAtom)
    const setMaterialType = useSetAtom(setMaterialTypeAtom)
    const setReserveAmount = useSetAtom(setItemReserveAmountAtom)
    const mat = useAtomValue(itemsStateAtom)
    const { reserve } = useAtomValue(filterOptionsAtom)
    const navigate = useNavigate()
    const setBlueprintStared = useSetAtom(setBlueprintStaredAtom)
    const blueprints = useAtomValue(blueprintsAtom)
    const stared = useAtomValue(staredAtom)

    const name = tradeItemData.name
    if (!name) return <></> // Guard against undefined name

    const { baseName, sources } = parseAggregatedName(name)
    const editMode = name && name === mat.editModeMaterialName

    const itemAtom = useMemo(() => getItemAtom(baseName), [baseName])
    const featureEnabledAtom = useMemo(() => isFeatureEnabledAtom(Feature.ttService), [])

    // Read values from atoms
    const item = useAtomValue(itemAtom)
    const showTTService = useAtomValue(featureEnabledAtom)

    // Create atoms for lazy-loaded blueprint tables
    const favoriteAtom = useMemo(() => getFavoriteBlueprintsAtom(baseName), [baseName])
    const ownedAtom = useMemo(() => getOwnedBlueprintsAtom(baseName), [baseName])
    const otherAtom = useMemo(() => getOtherBlueprintsAtom(baseName), [baseName])

    // Read blueprint data to check if empty
    const favoriteBlueprints = useAtomValue(favoriteAtom)
    const ownedBlueprints = useAtomValue(ownedAtom)
    const otherBlueprints = useAtomValue(otherAtom)

    // Blueprint table callbacks
    const blueprintCallbacks = useMemo(() => ({
        toggleStar: (bpName: string) => {
            const isStarred = stared.list.includes(bpName)
            setBlueprintStared(bpName, !isStarred)
        },
        navigateToBlueprint: (bpName: string) => {
            navigate(`${TabId.CRAFT}/${formatToUrl(bpName)}`)
        },
        getBlueprintQuantity: (bpName: string) => {
            const bp = blueprints[bpName]
            const webBp = bp?.web?.blueprint?.data?.value
            const loading = !webBp?.materials
            const quantity = webBp?.materials?.find((m: any) => m.name === baseName)?.quantity
            return { loading, quantity }
        }
    }), [blueprints, baseName, setBlueprintStared, navigate, stared])

    return <>
        <CollapsibleTradeItemDetailsWebDataControl
            title='Basic Information'
            sectionKey='basicInfo'
            valueGet={getItemWebAtom}
            loadGet={loadItemWebAtom}
            itemName={baseName}
            name='Basic Information'
            showWithErrors={true}
            content={(webItem: ItemWebData | undefined) => {
                const user = mat.map[baseName]?.user
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
                        <Field label='Reserve:' value={item.reserveAmount ?? ''} getChangeAction={(v) => setReserveAmount(baseName, v)}>
                            <span style={{ display: 'inline-flex', alignItems: 'center' }}>
                                <span style={{ fontSize: '0.85em', color: '#999', marginLeft: '15px' }}>{` PED (in TT value)${(user?.value ?? webItem?.value) ? `, quantity ${(Number(item.reserveAmount ?? 0) / (user?.value ?? webItem?.value ?? 0)).toFixed(0)}` : ''}`}</span>
                            </span>
                        </Field>
                    </div> }
                    <div style={{ borderTop: '1px solid #ddd', marginTop: '12px' }}>
                        <ItemMarkup name={baseName} />
                        {<div style={{ marginTop: '12px' }}>
                            <ItemCalculator name={baseName} />
                        </div>}
                    </div>
                    <ItemNotes name={baseName} style={{ marginTop: '12px' }}/>
                </>
            }}
        />
        { showTTService &&
            <CollapsibleTradeItemDetailsWebDataControl
                title='TT Inventory'
                sectionKey='ttInventory'
                valueGet={getTTServiceWebAtom}
                loadGet={() => loadTTServiceAtom}
                itemName={baseName}
                name='TT Inventory'
                content={(inventory: TTServiceInventoryWebData | undefined) => {
                    const list = React.useMemo(() => inventory?.filter(d => d.name === baseName), [inventory, baseName])
                    const ttServiceAtom = React.useMemo(() => atom(list ?? []), [list])
                    return list?.length === 0 ?
                        <p><strong>No entries in TT Service Inventory</strong></p> :
                        <JotaiSortableTable
                            itemsAtom={ttServiceAtom}
                            config={createTTServiceTableConfig()}
                            useFixedSizeList={false}
                        />
                }}
            />
        }
        <CollapsibleTradeItemDetailsWebDataControl
            title='Item Usage'
            sectionKey='itemUsage'
            valueGet={getItemUsageWebAtom}
            loadGet={loadItemUsageWebAtom}
            itemName={baseName}
            name='Item Usage'
            content={(usage: ItemUsageWebData | undefined) => {
                if (!usage) return <></>
                return <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '14px' }}>
                    <div>
                        { favoriteBlueprints.length > 0 ?
                            <JotaiSortableTable
                                itemsAtom={favoriteAtom}
                                maxNumberOfLines={6}
                                config={createBlueprintTableConfig('Favorite', true, blueprintCallbacks)}
                                useFixedSizeList={false}
                            /> :
                            <p style={{ color: '#666' }}>Not used on any {ownedBlueprints.length > 0 ? 'Favorite' : 'Owned'} Blueprint</p>
                        }
                    </div>
                    { ownedBlueprints.length > 0 && <div>
                        <JotaiSortableTable
                            itemsAtom={ownedAtom}
                            maxNumberOfLines={6}
                            config={createBlueprintTableConfig('Owned', false, blueprintCallbacks)}
                            useFixedSizeList={false}
                        />
                    </div> }
                    { otherBlueprints.length > 0 && <div>
                        <JotaiSortableTable
                            itemsAtom={otherAtom}
                            maxNumberOfLines={6}
                            config={createBlueprintTableConfig('Not Owned', undefined, blueprintCallbacks)}
                            useFixedSizeList={false}
                        />
                    </div> }

                    { usage.refinings && usage.refinings.length > 0 && <RefiningTableSection
                        refinings={usage.refinings}
                        chainNext={chainNext}
                        chainIndex={chainIndex}
                        ingredientName={baseName}
                    />}
                </div>
            }}
        />
        <ItemInventory materialItems={[baseName, ...(sources ?? [])]} />
    </>
}

export const InventoryOwnedList = () => {
    const tradeItemChain = useAtomValue(tradeItemChainAtom)
    const isShowingTradeItem = !!tradeItemChain
    const filterOptions = useAtomValue(filterOptionsAtom)
    const setHideCriteria = useSetAtom(hideCriteriaAtom)
    const hideCriteria = useAtomValue(hideCriteriaAtom)
    const setTradeItemChain = useSetAtom(setTradeItemChainAtom)

    const callbacks = React.useMemo(() => ({
        toggleHideName: (name: string, isCurrentlyHidden: boolean) => {
            if (isCurrentlyHidden) {
                setHideCriteria({ ...hideCriteria, name: hideCriteria.name.filter(n => n !== name) })
            } else {
                setHideCriteria({ ...hideCriteria, name: [...hideCriteria.name, name] })
            }
        },
        toggleHideValue: (value: number, isCurrentlyHidden: boolean) => {
            if (isCurrentlyHidden) {
                setHideCriteria({ ...hideCriteria, value: value - 0.01 })
            } else {
                setHideCriteria({ ...hideCriteria, value })
            }
        },
        toggleHideContainer: (container: string, isCurrentlyHidden: boolean) => {
            if (isCurrentlyHidden) {
                setHideCriteria({ ...hideCriteria, container: hideCriteria.container.filter(c => c !== container) })
            } else {
                setHideCriteria({ ...hideCriteria, container: [...hideCriteria.container, container] })
            }
        },
        toggleTradeItem: (item: ItemOwned) => {
            if (item.data.n) {
                if (item.t?.showingTradeItem) {
                    setTradeItemChain(undefined, 0)
                } else {
                    setTradeItemChain(item.data.n, 0)
                }
            }
        }
    }), [hideCriteria, setHideCriteria, setTradeItemChain])

    const config = React.useMemo(
        () => getInventoryColumnConfig(isShowingTradeItem, filterOptions.reserve, callbacks),
        [isShowingTradeItem, filterOptions.reserve, callbacks]
    )

    return (
        <JotaiSortableTableSection<ItemOwned>
            selector='TradePage.OwnedList'
            title='Owned List'
            subtitle='List of the Items you own, excluding hidden ones'
            itemsAtom={enrichedItemsAtom}
            config={config}
            maxNumberOfLines={30}
            afterSearch={<InventoryOwnedListAfterSearch />}
            beforeTable={<InventoryOwnedListBeforeTable />}
        >
            <TradeItemDetailsChain />
        </JotaiSortableTableSection>
    )
}
