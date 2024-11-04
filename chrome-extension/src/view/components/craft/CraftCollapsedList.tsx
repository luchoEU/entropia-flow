import React from 'react'
import { useSelector } from 'react-redux'
import { setBlueprintActivePage, setBlueprintExpanded, setBlueprintStared, setStaredBlueprintsExpanded, setStaredBlueprintsFilter, sortBlueprintsBy } from '../../application/actions/craft'
import { BUDGET, CASH, CLICKS, getItemAvailable, getLimitText, ITEMS, LIMIT, NAME, sortColumnDefinition } from '../../application/helpers/craftSort'
import { getCraft, getStaredBlueprintItem } from '../../application/selectors/craft'
import { BlueprintData, CraftState } from '../../application/state/craft'
import SortableTableSection, { ItemRowData, SortRowData } from '../common/SortableTableSection'

const sortRowData: SortRowData = {
    [CLICKS]: { justifyContent: 'center' },
    [ITEMS]: { justifyContent: 'center' },
    [CASH]: { justifyContent: 'end' },
    [BUDGET]: { justifyContent: 'end' },
}
const getRowData = (d: BlueprintData): ItemRowData => ({
    dispatch: () => setBlueprintActivePage(d.name),
    columns: {
        [NAME]: {
            sub: [{
                itemText: d.itemName
            }, {
                flex: 1,
                img: { src: 'img/right.png' }
            }, {
                imgButton: {
                    title: 'Remove this blueprint from Favorites',
                    src: 'img/staron.png',
                    dispatch: () => setBlueprintStared(d.name, false)
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
            expanded={s.stared.expanded}
            filter={s.stared.filter}
            allItems={s.blueprints}
            showItems={s.c.filteredStaredBlueprints}
            sortType={s.stared.sortType}
            stats={{ count: s.c.filteredStaredBlueprints.length, itemTypeName: 'blueprint' }}
            setExpanded={setStaredBlueprintsExpanded}
            setFilter={setStaredBlueprintsFilter}
            sortBy={sortBlueprintsBy}
            columns={columns}
            definition={sortColumnDefinition}
            sortRowData={sortRowData}
            getRowData={getRowData}
            itemSelector={getStaredBlueprintItem}
        />
    </>
}

export default CraftCollapsedList
