import React from 'react'
import { useAtomValue, useSetAtom } from 'jotai'
import { blueprintsAtom, staredAtom, reloadBlueprintAtom, setBlueprintStaredAtom, setStaredBlueprintsFilterAtom, sortBlueprintsByAtom, filteredStaredBlueprintsAtom, blueprintAutoCalcAtom } from '../../application/atoms/craft'
import { BUDGET, CASH, CLICK_TT_COST, CLICKS, getItemAvailable, getItemClickTTCost, getItemType, getLimitText, ITEMS, LIMIT, NAME, sortColumnDefinition, TYPE } from '../../application/helpers/craftSort'
import { BlueprintData } from '../../application/state/craft'
import SortableTableSection, { ItemRowData, ItemRowSubColumnData, SortRowData } from '../common/SortableTableSection'
import { NavigateFunction } from 'react-router-dom'
import { craftBlueprintUrl, navigateTo } from '../../application/actions/navigation'
import CraftPlanet from './CraftPlanet'

const sortRowData: SortRowData = {
    [CLICKS]: { justifyContent: 'center' },
    [ITEMS]: { justifyContent: 'center' },
    [LIMIT]: { justifyContent: 'start' },
    [CASH]: { justifyContent: 'end' },
    [BUDGET]: { justifyContent: 'end' },
    [TYPE]: { justifyContent: 'start' },
    [CLICK_TT_COST]: { justifyContent: 'end' },
}
const reloadSub = (errors: { message: string }[]): ItemRowSubColumnData[] => [{
    class: 'clicks-error',
    title: `${errors.length === 0 ? '' : errors.map(e => e.message).join(' ')+' '}Click to try to load blueprint again`,
    compose: [ { itemText: 'Error' }, { img: { src:'img/reload.png', show: true } }]
}]

const getRowData = (reloadBlueprint: (name: string) => void, setBlueprintStared: (name: string, stared: boolean) => void, autoCalcData: {[name: string]: any}) => (d: BlueprintData): ItemRowData => {
    const dAutoCalc = autoCalcData[d.name]
    return {
    dispatch: (n: NavigateFunction) => navigateTo(n, craftBlueprintUrl(d.name)),
    columns: {
        [NAME]: {
            sub: [{
                itemText: dAutoCalc?.itemName ?? d.name
            }, {
                flex: 1,
                img: { src: 'img/right.png' }
            }, {
                title: 'Remove this blueprint from Favorites',
                imgButton: {
                    src: 'img/staron.png',
                    dispatch: () => setBlueprintStared(d.name, false)
                }
            }]
        },
        [TYPE]: {
            sub: [{ itemText: getItemType(d) }]
        },
        [CLICKS]: {
            style: { justifyContent: 'center' },
            dispatch: !d.web?.blueprint.loading && !d.user && (() => reloadBlueprint(d.name)),
            sub: !d.web && !d.user ? reloadSub([]) :
                    (d.web?.blueprint.loading ?
                        [{ img: { src: 'img/loading.gif', show: true}, class: 'img-loading' }] :
                        (d.web?.blueprint.errors && !d.user ?
                            reloadSub(d.web.blueprint.errors) :
                            [{ itemText: dAutoCalc?.clicks?.available?.toString() }]))
        },
        [LIMIT]: {
            sub: [{ itemText: getLimitText(d) }]
        },
        [ITEMS]: {
            style: { justifyContent: 'center' },
            sub: [{
                visible: getItemAvailable(d) > 0,
                itemText: getItemAvailable(d).toString()
            }]
        },
        [CLICK_TT_COST]: {
            style: { justifyContent: 'end' },
            sub: [{
                itemText: getItemClickTTCost(d) > 0 ? getItemClickTTCost(d).toFixed(2) + ' PED' : ''
            }]
        },
        [CASH]: {
            style: { justifyContent: 'end' },
            sub: [{
                itemText: d.budget?.sheet ? d.budget.sheet.peds.toFixed(2) + ' PED' : ''
            }]
        },
        [BUDGET]: {
            style: { justifyContent: 'end' },
            sub: [{
                itemText: d.budget?.sheet ? d.budget.sheet.total.toFixed(2) + ' PED' : ''
            }]
        }
    }
    }
}

function CraftFavoriteList() {
    const blueprints = useAtomValue(blueprintsAtom)
    const autoCalcData = useAtomValue(blueprintAutoCalcAtom)
    const stared = useAtomValue(staredAtom)
    const filteredStared = useAtomValue(filteredStaredBlueprintsAtom)

    const reloadBlueprint = useSetAtom(reloadBlueprintAtom)
    const setBlueprintStared = useSetAtom(setBlueprintStaredAtom)
    const setStaredBlueprintsFilter = useSetAtom(setStaredBlueprintsFilterAtom)
    const sortBlueprintsBy = useSetAtom(sortBlueprintsByAtom)

    const blueprintValues = Object.values(blueprints)
    if (blueprintValues.length == 0)
        return <></>

    var clicks = blueprintValues.some(d => autoCalcData[d.name]?.clicks)
    var limit = blueprintValues.some(d => autoCalcData[d.name]?.clicks?.limitingItems?.length > 0)
    var items = blueprintValues.some(d => getItemAvailable(d) > 0)
    var budget = blueprintValues.some(d => d.budget?.sheet?.total !== undefined)
    var cash = blueprintValues.some(d => d.budget?.sheet?.peds !== undefined)
    var type = blueprintValues.some(d => getItemType(d))
    var clickTTCost = blueprintValues.some(d => getItemClickTTCost(d) > 0)

    const columns: number[] = [NAME]
    if (clicks) columns.push(CLICKS)
    if (limit) columns.push(LIMIT)
    if (type) columns.push(TYPE)
    if (items) columns.push(ITEMS)
    if (clickTTCost) columns.push(CLICK_TT_COST)
    if (budget) columns.push(BUDGET)
    if (cash) columns.push(CASH)

    return <>
        <SortableTableSection
            selector='CraftCollapsedList'
            title='Favorite Blueprints'
            subtitle='Your favorite blueprints, for easy access'
            expanded={stared.expanded}
            filter={stared.filter}
            stats={{ count: filteredStared.length, itemTypeName: 'blueprint' }}
            setFilter={setStaredBlueprintsFilter}
            table={{
                widthItems: blueprintValues,
                showItems: filteredStared,
                sortType: stared.sortType,
                sortBy: sortBlueprintsBy,
                itemSelector: (index: number) => () => filteredStared[index],
                tableData: {
                    columns,
                    definition: sortColumnDefinition,
                    sortRow: sortRowData,
                    getRow: getRowData(reloadBlueprint, setBlueprintStared, autoCalcData)
                }
            }}
            afterTitle={<CraftPlanet />}
        />
    </>
}

export default CraftFavoriteList
