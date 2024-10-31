import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeBlueprint, setActiveBlueprintsExpanded, setActiveBlueprintsFilter, setBlueprintExpanded, sortBlueprintsBy } from '../../application/actions/craft'
import { BUDGET, CASH, CLICKS, getItemAvailable, getLimitText, ITEMS, LIMIT, NAME, sortColumnDefinition } from '../../application/helpers/craftSort'
import { getActiveBlueprintItem, getCraft } from '../../application/selectors/craft'
import { BlueprintData, CraftState } from '../../application/state/craft'
import SortableTableSection, { ItemRowData, SortRowData } from '../common/SortableTableSection'

const sortRowData: SortRowData = {
    [CLICKS]: { justifyContent: 'center' },
    [ITEMS]: { justifyContent: 'center' },
    [CASH]: { justifyContent: 'end' },
    [BUDGET]: { justifyContent: 'end' },
}
const getRowData = (d: BlueprintData): ItemRowData => ({
    dispatch: () => setBlueprintExpanded(d.name)(!d.expanded),
    columns: {
        [NAME]: {
            sub: [{
                plusButton: {
                    expanded: d.expanded,
                    setExpanded: () => setBlueprintExpanded(d.name),
                }
            }, {
                flex: 1,
                itemText: d.itemName
            }, {
                imgButton: {
                    title: 'Remove this blueprint from Favorites',
                    src: 'img/staron.png',
                    dispatch: () => removeBlueprint(d.name)
                }
            }]
        },
        [CLICKS]: {
            style: { justifyContent: 'center' },
            sub: d.info.loading ? 
                [{ img: { src: 'img/loading.gif', show: true}, class: 'img-loading' }] :
                [{ itemText: d.inventory?.clicksAvailable.toString() }]
        },
        [LIMIT]: {
            sub: [{
                itemText: getLimitText(d)
            }]
        },
        [ITEMS]: {
            style: { justifyContent: 'center' },
            sub: [{
                visible: getItemAvailable(d) > 0,
                itemText: getItemAvailable(d).toString()
            }]
        },
        [CASH]: {
            style: { justifyContent: 'end' },
            sub: [{
                itemText: d.budget.peds?.toFixed(2) + ' PED'
            }]
        },
        [BUDGET]: {
            style: { justifyContent: 'end' },
            sub: [{
                itemText: d.budget.total?.toFixed(2) + ' PED'
            }]
        }
    }
});

function CraftCollapsedList() {
    const s: CraftState = useSelector(getCraft)
    const dispatch = useDispatch()

    if (s.blueprints.length == 0)
        return <></>
    
    var clicks = s.blueprints.some(d => d.inventory)
    var limit = s.blueprints.some(d => d.inventory?.limitClickItems?.length > 0)
    var items = s.blueprints.some(d => getItemAvailable(d) > 0)
    var budget = s.blueprints.some(d => d.budget.total !== undefined)
    var cash = s.blueprints.some(d => d.budget.peds !== undefined)

    const columns: number[] = [NAME]
    if (clicks) columns.push(CLICKS)
    if (limit) columns.push(LIMIT)
    if (items) columns.push(ITEMS)
    if (budget) columns.push(BUDGET)
    if (cash) columns.push(CASH)

    return <>
        <SortableTableSection
            title='Favorite Blueprints'
            expanded={s.activeBlueprintsExpanded}
            filter={s.blueprintFilter}
            allItems={s.blueprints}
            showItems={s.c.filteredBluprints}
            sortType={s.sortType}
            stats={{ count: s.c.filteredBluprints.length, itemTypeName: 'blueprint' }}
            setExpanded={setActiveBlueprintsExpanded}
            setFilter={setActiveBlueprintsFilter}
            sortBy={sortBlueprintsBy}
            columns={columns}
            definition={sortColumnDefinition}
            sortRowData={sortRowData}
            getRowData={getRowData}
            itemSelector={getActiveBlueprintItem}
        />
    </>
}

export default CraftCollapsedList
