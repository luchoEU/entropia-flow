import React, { useMemo } from 'react'
import { atom } from 'jotai'
import { useAtomValue, useSetAtom } from 'jotai'
import { blueprintsAtom, staredAtom, reloadBlueprintAtom, setBlueprintStaredAtom, setStaredBlueprintsFilterAtom, filteredStaredBlueprintsAtom, blueprintAutoCalcAtom } from '../../application/atoms/craft'
import { BUDGET, CASH, CLICK_TT_COST, CLICKS, getItemAvailable, getItemClickTTCost, getItemType, getLimitText, ITEMS, LIMIT, NAME, TYPE } from '../../application/helpers/craftSort'
import { BlueprintData } from '../../application/state/craft'
import { JotaiSortableTableSection } from '../common/jotai/JotaiSortableTableSection'
import { useNavigate } from 'react-router-dom'
import { formatToUrl } from '../../application/helpers/navigation'
import { TabId } from '../../application/state/navigation'
import CraftPlanet from './CraftPlanet'
import ImgButton from '../common/ImgButton'

function CraftFavoriteList() {
    const navigate = useNavigate()
    const blueprints = useAtomValue(blueprintsAtom)
    const autoCalcData = useAtomValue(blueprintAutoCalcAtom)
    const stared = useAtomValue(staredAtom)
    const filteredStared = useAtomValue(filteredStaredBlueprintsAtom)

    const reloadBlueprint = useSetAtom(reloadBlueprintAtom)
    const setBlueprintStared = useSetAtom(setBlueprintStaredAtom)
    const setStaredBlueprintsFilter = useSetAtom(setStaredBlueprintsFilterAtom)

    const blueprintValues = Object.values(blueprints)

    // Determine which columns to show based on available data
    const clicks = blueprintValues.some(d => autoCalcData[d.name]?.clicks)
    const limit = blueprintValues.some(d => autoCalcData[d.name]?.clicks?.limitingItems?.length > 0)
    const items = blueprintValues.some(d => getItemAvailable(d) > 0)
    const budget = blueprintValues.some(d => d.budget?.sheet?.total !== undefined)
    const cash = blueprintValues.some(d => d.budget?.sheet?.peds !== undefined)
    const type = blueprintValues.some(d => getItemType(d))
    const clickTTCost = blueprintValues.some(d => getItemClickTTCost(d) > 0)

    // Create atom for filtered blueprints (MUST be before early return)
    const filteredBlueprintsAtom = useMemo(() => atom(filteredStared), [filteredStared])

    // Build column configuration dynamically (MUST be before early return)
    const columns = useMemo(() => {
        const cols: Array<any> = [
            {
                id: 'name',
                header: 'Name',
                width: 200,
                sortAccessor: (d: BlueprintData) => d.name,
                filterAccessor: (d: BlueprintData) => d.name,
                renderRowCell: (d: BlueprintData) => {
                    const dAutoCalc = autoCalcData[d.name]
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{dAutoCalc?.itemName ?? d.name}</span>
                            <img src='img/right.png' alt='' style={{ width: '16px', opacity: 0.6 }} />
                            <ImgButton
                                title='Remove this blueprint from Favorites'
                                src='img/staron.png'
                                dispatch={() => setBlueprintStared(d.name, false)}
                            />
                        </div>
                    )
                }
            }
        ]

        if (clicks) {
            cols.push({
                id: 'clicks',
                header: 'Clicks',
                width: 100,
                sortAccessor: (d: BlueprintData) => {
                    const autoCalc = autoCalcData?.[d.name]
                    return autoCalc?.clicks?.available ?? 0
                },
                filterAccessor: (d: BlueprintData) => {
                    const autoCalc = autoCalcData?.[d.name]
                    return autoCalc?.clicks?.available?.toString() ?? ''
                },
                justifyContent: 'center' as const,
                renderRowCell: (d: BlueprintData) => {
                    if (!d.web && !d.user) {
                        return (
                            <button
                                onClick={() => reloadBlueprint(d.name)}
                                title='Click to try to load blueprint again'
                                style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}
                            >
                                Error <img src='img/reload.png' alt='reload' style={{ width: '12px', marginLeft: '4px' }} />
                            </button>
                        )
                    }
                    if (d.web?.blueprint.loading) {
                        return <img src='img/loading.gif' alt='loading' style={{ width: '16px' }} />
                    }
                    if (d.web?.blueprint.errors && !d.user) {
                        const errorMsg = d.web.blueprint.errors.map(e => e.message).join(' ')
                        return (
                            <button
                                onClick={() => reloadBlueprint(d.name)}
                                title={`${errorMsg} Click to try to load blueprint again`}
                                style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}
                            >
                                Error <img src='img/reload.png' alt='reload' style={{ width: '12px', marginLeft: '4px' }} />
                            </button>
                        )
                    }
                    const dAutoCalc = autoCalcData[d.name]
                    return <>{dAutoCalc?.clicks?.available?.toString() ?? '-'}</>
                }
            })
        }

        if (limit) {
            cols.push({
                id: 'limit',
                header: 'Limits clicks',
                width: 150,
                sortAccessor: (d: BlueprintData) => getLimitText(d),
                filterAccessor: (d: BlueprintData) => getLimitText(d),
                renderRowCell: (d: BlueprintData) => <>{getLimitText(d)}</>
            })
        }

        if (type) {
            cols.push({
                id: 'type',
                header: 'Type',
                width: 100,
                sortAccessor: (d: BlueprintData) => getItemType(d),
                filterAccessor: (d: BlueprintData) => getItemType(d),
                renderRowCell: (d: BlueprintData) => <>{getItemType(d)}</>
            })
        }

        if (items) {
            cols.push({
                id: 'items',
                header: 'Items',
                width: 80,
                sortAccessor: (d: BlueprintData) => getItemAvailable(d),
                filterAccessor: (d: BlueprintData) => getItemAvailable(d).toString(),
                justifyContent: 'center' as const,
                renderRowCell: (d: BlueprintData) => {
                    const available = getItemAvailable(d)
                    return available > 0 ? <>{available}</> : <></>
                }
            })
        }

        if (clickTTCost) {
            cols.push({
                id: 'clickTTCost',
                header: 'Click TT Cost',
                width: 120,
                sortAccessor: (d: BlueprintData) => getItemClickTTCost(d),
                filterAccessor: (d: BlueprintData) => getItemClickTTCost(d).toString(),
                justifyContent: 'end' as const,
                renderRowCell: (d: BlueprintData) => {
                    const cost = getItemClickTTCost(d)
                    return <>{cost > 0 ? cost.toFixed(2) + ' PED' : ''}</>
                }
            })
        }

        if (budget) {
            cols.push({
                id: 'budget',
                header: 'Budget',
                width: 100,
                sortAccessor: (d: BlueprintData) => d.budget?.sheet?.total ?? 0,
                filterAccessor: (d: BlueprintData) => d.budget?.sheet?.total?.toString() ?? '',
                justifyContent: 'end' as const,
                renderRowCell: (d: BlueprintData) => {
                    const total = d.budget?.sheet?.total
                    return <>{total ? total.toFixed(2) + ' PED' : ''}</>
                }
            })
        }

        if (cash) {
            cols.push({
                id: 'cash',
                header: 'Cash',
                width: 100,
                sortAccessor: (d: BlueprintData) => d.budget?.sheet?.peds ?? 0,
                filterAccessor: (d: BlueprintData) => d.budget?.sheet?.peds?.toString() ?? '',
                justifyContent: 'end' as const,
                renderRowCell: (d: BlueprintData) => {
                    const peds = d.budget?.sheet?.peds
                    return <>{peds ? peds.toFixed(2) + ' PED' : ''}</>
                }
            })
        }

        return cols
    }, [clicks, limit, items, budget, cash, type, clickTTCost, autoCalcData, reloadBlueprint, setBlueprintStared])

    if (blueprintValues.length === 0)
        return <></>

    return (
        <JotaiSortableTableSection
            selector='CraftCollapsedList'
            title='Favorite Blueprints'
            subtitle='Your favorite blueprints, for easy access'
            itemsAtom={filteredBlueprintsAtom}
            config={{
                title: 'Favorite Blueprints',
                columns,
                itemTypeName: 'blueprint',
                getRowKey: (item: BlueprintData) => item.name,
                onRowClick: (item: BlueprintData) => {
                    navigate(`${TabId.CRAFT}/${formatToUrl(item.name)}`)
                }
            }}
            afterTitle={<CraftPlanet />}
        />
    )
}

export default CraftFavoriteList
