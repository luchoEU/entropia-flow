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

    const blueprintEntries = Object.entries(blueprints)

    // Determine which columns to show based on available data
    const clicks = blueprintEntries.some(([name]) => autoCalcData[name]?.clicks)
    const limit = blueprintEntries.some(([name]) => (autoCalcData[name]?.clicks?.limitingItems?.length ?? 0) > 0)
    const items = blueprintEntries.some(([name, d]) => getItemAvailable(name, d) > 0)
    const budget = blueprintEntries.some(([name, d]) => d.budget?.sheet?.total !== undefined)
    const cash = blueprintEntries.some(([name, d]) => d.budget?.sheet?.peds !== undefined)
    const type = blueprintEntries.some(([name, d]) => getItemType(d))
    const clickTTCost = blueprintEntries.some(([name, d]) => getItemClickTTCost(name, d) > 0)

    // Wrap filtered blueprints with their names for table display
    const filteredBlueprintsWithNames = useMemo(() =>
        stared.list
            .filter(name => filteredStared.some(bp => blueprints[name] === bp))
            .map(name => ({ _bpName: name, ...blueprints[name] } as BlueprintData & { _bpName: string })),
        [filteredStared, stared.list, blueprints]
    )

    // Create atom for filtered blueprints (MUST be before early return)
    const filteredBlueprintsAtom = useMemo(() => atom(filteredBlueprintsWithNames), [filteredBlueprintsWithNames])

    // Build column configuration dynamically (MUST be before early return)
    const columns = useMemo(() => {
        const cols: Array<any> = [
            {
                id: 'name',
                header: 'Name',
                width: 200,
                sortAccessor: (d: BlueprintData & { _bpName: string }) => d._bpName,
                filterAccessor: (d: BlueprintData & { _bpName: string }) => d._bpName,
                renderRowCell: (d: BlueprintData & { _bpName: string }) => {
                    const dAutoCalc = autoCalcData[d._bpName]
                    return (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>{dAutoCalc?.itemName ?? d._bpName}</span>
                            <img src='img/right.png' alt='' style={{ width: '16px', opacity: 0.6 }} />
                            <ImgButton
                                title='Remove this blueprint from Favorites'
                                src='img/staron.png'
                                dispatch={() => setBlueprintStared(d._bpName, false)}
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
                sortAccessor: (d: BlueprintData & { _bpName: string }) => {
                    const autoCalc = autoCalcData?.[d._bpName]
                    return autoCalc?.clicks?.available ?? 0
                },
                filterAccessor: (d: BlueprintData & { _bpName: string }) => {
                    const autoCalc = autoCalcData?.[d._bpName]
                    return autoCalc?.clicks?.available?.toString() ?? ''
                },
                justifyContent: 'center' as const,
                renderRowCell: (d: BlueprintData & { _bpName: string }) => {
                    if (!d.web && !d.user) {
                        return (
                            <button
                                onClick={() => reloadBlueprint(d._bpName)}
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
                                onClick={() => reloadBlueprint(d._bpName)}
                                title={`${errorMsg} Click to try to load blueprint again`}
                                style={{ cursor: 'pointer', background: 'none', border: 'none', color: 'red' }}
                            >
                                Error <img src='img/reload.png' alt='reload' style={{ width: '12px', marginLeft: '4px' }} />
                            </button>
                        )
                    }
                    const dAutoCalc = autoCalcData[d._bpName]
                    return <>{dAutoCalc?.clicks?.available?.toString() ?? '-'}</>
                }
            })
        }

        if (limit) {
            cols.push({
                id: 'limit',
                header: 'Limits clicks',
                width: 150,
                sortAccessor: (d: BlueprintData & { _bpName: string }) => getLimitText(d._bpName, d, autoCalcData),
                filterAccessor: (d: BlueprintData & { _bpName: string }) => getLimitText(d._bpName, d, autoCalcData),
                renderRowCell: (d: BlueprintData & { _bpName: string }) => <>{getLimitText(d._bpName, d, autoCalcData)}</>
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
                sortAccessor: (d: BlueprintData & { _bpName: string }) => getItemAvailable(d._bpName, d, autoCalcData),
                filterAccessor: (d: BlueprintData & { _bpName: string }) => getItemAvailable(d._bpName, d, autoCalcData).toString(),
                justifyContent: 'center' as const,
                renderRowCell: (d: BlueprintData & { _bpName: string }) => {
                    const available = getItemAvailable(d._bpName, d, autoCalcData)
                    return available > 0 ? <>{available}</> : <></>
                }
            })
        }

        if (clickTTCost) {
            cols.push({
                id: 'clickTTCost',
                header: 'Click TT Cost',
                width: 120,
                sortAccessor: (d: BlueprintData & { _bpName: string }) => getItemClickTTCost(d._bpName, d, autoCalcData),
                filterAccessor: (d: BlueprintData & { _bpName: string }) => getItemClickTTCost(d._bpName, d, autoCalcData).toString(),
                justifyContent: 'end' as const,
                renderRowCell: (d: BlueprintData & { _bpName: string }) => {
                    const cost = getItemClickTTCost(d._bpName, d, autoCalcData)
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

    if (blueprintEntries.length === 0)
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
                getRowKey: (item: BlueprintData & { _bpName: string }) => item._bpName,
                onRowClick: (item: BlueprintData & { _bpName: string }) => {
                    navigate(`${TabId.CRAFT}/${formatToUrl(item._bpName)}`)
                }
            }}
            afterTitle={<CraftPlanet />}
        />
    )
}

export default CraftFavoriteList
