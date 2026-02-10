import React, { useMemo } from 'react'
import { atom } from 'jotai'
import { useAtomValue, useSetAtom } from 'jotai'
import { blueprintsAtom, staredAtom, reloadBlueprintAtom, setBlueprintStaredAtom, setStaredBlueprintsFilterAtom, filteredStaredBlueprintsAtom, blueprintAutoCalcAtom } from '../../application/atoms/craft'
import { getItemAvailable, getItemClickTTCost, getItemType, getLimitText } from '../../application/helpers/craftSort'
import { BlueprintData } from '../../application/state/craft'
import { JotaiSortableTableSection } from '../common/jotai/JotaiSortableTableSection'
import { useNavigate } from 'react-router-dom'
import { formatToUrl } from '../../application/helpers/navigation'
import { TabId } from '../../application/state/navigation'
import CraftPlanet from './CraftPlanet'

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
                renderRow: (d: BlueprintData & { _bpName: string }) => {
                    const dAutoCalc = autoCalcData[d._bpName]
                    return {
                        type: 'row' as const,
                        gap: 8,
                        children: [
                            {
                                type: 'text' as const,
                                value: dAutoCalc?.itemName ?? d._bpName
                            },
                            {
                                type: 'icon' as const,
                                src: 'img/right.png',
                                width: 16,
                                height: 16,
                                alt: ''
                            },
                            {
                                type: 'button' as const,
                                icon: 'img/staron.png',
                                width: 16,
                                title: 'Remove this blueprint from Favorites',
                                onClick: () => setBlueprintStared(d._bpName, false)
                            }
                        ]
                    }
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
                renderRow: (d: BlueprintData & { _bpName: string }) => {
                    // Check: no data
                    if (!d.web && !d.user) {
                        return {
                            type: 'row' as const,
                            gap: 4,
                            children: [
                                {
                                    type: 'textButton' as const,
                                    text: 'Error',
                                    onClick: () => reloadBlueprint(d._bpName),
                                    title: 'Click to try to load blueprint again',
                                    style: { cursor: 'pointer', background: 'none', border: 'none', color: 'red' },
                                    estimatedWidth: 60
                                },
                                {
                                    type: 'icon' as const,
                                    src: 'img/reload.png',
                                    width: 12,
                                    height: 12,
                                    alt: 'reload'
                                }
                            ]
                        }
                    }
                    // Check: loading
                    if (d.web?.blueprint.loading) {
                        return {
                            type: 'icon' as const,
                            src: 'img/loading.gif',
                            width: 16,
                            height: 16,
                            alt: 'loading'
                        }
                    }
                    // Check: errors
                    if (d.web?.blueprint.errors && !d.user) {
                        const errorMsg = d.web.blueprint.errors.map(e => e.message).join(' ')
                        return {
                            type: 'row' as const,
                            gap: 4,
                            children: [
                                {
                                    type: 'textButton' as const,
                                    text: 'Error',
                                    onClick: () => reloadBlueprint(d._bpName),
                                    title: `${errorMsg} Click to try to load blueprint again`,
                                    style: { cursor: 'pointer', background: 'none', border: 'none', color: 'red' },
                                    estimatedWidth: 60
                                },
                                {
                                    type: 'icon' as const,
                                    src: 'img/reload.png',
                                    width: 12,
                                    height: 12,
                                    alt: 'reload'
                                }
                            ]
                        }
                    }
                    // Normal: show clicks
                    const dAutoCalc = autoCalcData[d._bpName]
                    return {
                        type: 'text' as const,
                        value: dAutoCalc?.clicks?.available?.toString() ?? '-'
                    }
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
                renderRow: (d: BlueprintData & { _bpName: string }) => ({
                    type: 'text' as const,
                    value: getLimitText(d._bpName, d, autoCalcData)
                })
            })
        }

        if (type) {
            cols.push({
                id: 'type',
                header: 'Type',
                width: 100,
                sortAccessor: (d: BlueprintData) => getItemType(d),
                filterAccessor: (d: BlueprintData) => getItemType(d),
                renderRow: (d: BlueprintData) => ({
                    type: 'text' as const,
                    value: getItemType(d)
                })
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
                renderRow: (d: BlueprintData & { _bpName: string }) => {
                    const available = getItemAvailable(d._bpName, d, autoCalcData)
                    return {
                        type: 'text' as const,
                        value: available > 0 ? available.toString() : ''
                    }
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
                renderRow: (d: BlueprintData & { _bpName: string }) => {
                    const cost = getItemClickTTCost(d._bpName, d, autoCalcData)
                    return {
                        type: 'text' as const,
                        value: cost > 0 ? cost.toFixed(2) + ' PED' : ''
                    }
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
                renderRow: (d: BlueprintData) => {
                    const total = d.budget?.sheet?.total
                    return {
                        type: 'text' as const,
                        value: total ? total.toFixed(2) + ' PED' : ''
                    }
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
                renderRow: (d: BlueprintData) => {
                    const peds = d.budget?.sheet?.peds
                    return {
                        type: 'text' as const,
                        value: peds ? peds.toFixed(2) + ' PED' : ''
                    }
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
