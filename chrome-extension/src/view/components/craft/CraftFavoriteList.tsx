import React from 'react'
import { useSelector } from 'react-redux'
import { reloadBlueprint, setBlueprintStared, setStaredBlueprintsFilter, sortBlueprintsBy } from '../../application/actions/craft'
import { BUDGET, CASH, CLICK_TT_COST, CLICKS, getItemAvailable, getItemClickTTCost, getItemType, getLimitText, ITEMS, LIMIT, NAME, sortColumnDefinition, TYPE } from '../../application/helpers/craftSort'
import { getCraft, getStaredBlueprintItem } from '../../application/selectors/craft'
import { BlueprintData, CraftState } from '../../application/state/craft'
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
const getRowData = (d: BlueprintData): ItemRowData => ({
    dispatch: (n: NavigateFunction) => navigateTo(n, craftBlueprintUrl(d.name)),
    columns: {
        [NAME]: {
            sub: [{
                itemText: d.c?.itemName ?? d.name
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
                            [{ itemText: d.c.clicks?.available?.toString() }]))
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
                itemText: d.budget.sheet ? d.budget.sheet.peds.toFixed(2) + ' PED' : ''
            }]
        },
        [BUDGET]: {
            style: { justifyContent: 'end' },
            sub: [{
                itemText: d.budget.sheet ? d.budget.sheet.total.toFixed(2) + ' PED' : ''
            }]
        }
    }
});

function CraftFavoriteList() {
    const s: CraftState = useSelector(getCraft)

    const blueprints = Object.values(s.blueprints)
    if (blueprints.length == 0)
        return <></>
    
    var clicks = blueprints.some(d => d.c?.clicks)
    var limit = blueprints.some(d => d.c?.clicks?.limitingItems?.length > 0)
    var items = blueprints.some(d => getItemAvailable(d) > 0)
    var budget = blueprints.some(d => d.budget?.sheet?.total !== undefined)
    var cash = blueprints.some(d => d.budget?.sheet?.peds !== undefined)
    var type = blueprints.some(d => getItemType(d))
    var clickTTCost = blueprints.some(d => getItemClickTTCost(d) > 0)

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
            expanded={s.stared.expanded}
            filter={s.stared.filter}
            stats={{ count: s.c.filteredStaredBlueprints.length, itemTypeName: 'blueprint' }}
            setFilter={setStaredBlueprintsFilter}
            table={{
                widthItems: blueprints,
                showItems: s.c.filteredStaredBlueprints,
                sortType: s.stared.sortType,
                sortBy: sortBlueprintsBy,
                itemSelector: getStaredBlueprintItem,
                tableData: {
                    columns,
                    definition: sortColumnDefinition,
                    sortRow: sortRowData,
                    getRow: getRowData
                }
            }}
            afterTitle={<CraftPlanet />}
        />
    </>
}

export default CraftFavoriteList
