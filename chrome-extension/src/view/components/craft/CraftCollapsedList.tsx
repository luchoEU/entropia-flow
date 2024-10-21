import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeBlueprint, setActiveBlueprintsExpanded, setBlueprintExpanded, sortBlueprintsBy } from '../../application/actions/craft'
import { BUDGET, CASH, CLICKS, ITEMS, LIMIT, NAME, sortColumnDefinition } from '../../application/helpers/craftSort'
import { getCraft } from '../../application/selectors/craft'
import { BlueprintData, CraftState } from '../../application/state/craft'
import ExpandableSection from '../common/ExpandableSection'
import ExpandablePlusButton from '../common/ExpandablePlusButton'
import SortableTable from '../common/SortableTable'

function CraftCollapsedList() {
    const s: CraftState = useSelector(getCraft)
    const dispatch = useDispatch()

    if (s.blueprints.length == 0)
        return <></>
    
    var clicksMap = undefined
    var limitMap = undefined
    var itemsMap = undefined
    var budgetMap = undefined
    var cashMap = undefined

    s.blueprints.forEach((d: BlueprintData) => {
        if (d.inventory) {
            if (!clicksMap)
                clicksMap = {}
            clicksMap[d.name] = d.inventory.clicksAvailable

            if (d.inventory.limitClickItems?.length > 0) {
                if (!limitMap)
                    limitMap = {}
                limitMap[d.name] = d.inventory.limitClickItems.length > 2 ? 
                    `${d.inventory.limitClickItems.slice(0, 2).join(', ')}, ${d.inventory.limitClickItems.length - 2} more` : 
                    d.inventory.limitClickItems.join(', ')
            }
        }

        var itemAvailable = d.info.materials.find(m => m.name === "Item")?.available ?? 0
        if (itemAvailable > 0) {
            if (itemsMap === undefined)
                itemsMap = {}
            itemsMap[d.name] = itemAvailable
        }

        if (d.budget.total !== undefined) {
            if (budgetMap === undefined)
                budgetMap = {}
            budgetMap[d.name] = d.budget.total.toFixed(2) + ' PED'
        }

        if (d.budget.peds !== undefined) {
            if (cashMap === undefined)
                cashMap = {}
            cashMap[d.name] = d.budget.peds.toFixed(2) + ' PED'
        }
    })

    const expand = (name: string) => setBlueprintExpanded(name)
    const columns: number[] = [NAME]
    if (clicksMap) columns.push(CLICKS)
    if (limitMap) columns.push(LIMIT)
    if (itemsMap) columns.push(ITEMS)
    if (budgetMap) columns.push(BUDGET)
    if (cashMap) columns.push(CASH)

    return (
        <ExpandableSection title='Favorite Blueprints' expanded={s.activeBlueprintsExpanded} setExpanded={setActiveBlueprintsExpanded}>
            <SortableTable
                sortType={s.sortType}
                sortBy={sortBlueprintsBy}
                columns={columns}
                definition={sortColumnDefinition}>
                {
                    s.blueprints.map((d: BlueprintData) =>
                        <tr key={d.name}>
                            <td>
                                <ExpandablePlusButton expanded={d.expanded} setExpanded={expand(d.name)} />{d.itemName}
                                <img src='img/staron.png' onClick={() => dispatch(removeBlueprint(d.name))} />
                            </td>
                            { clicksMap && <td align='center'>{clicksMap[d.name]}</td> }
                            { limitMap && <td style={{ textAlign: 'left' }}>{limitMap[d.name]}</td> }
                            { itemsMap && <td align='center'>{itemsMap[d.name]}</td> }
                            { budgetMap && <td align='right'>{budgetMap[d.name]}</td> }
                            { cashMap && <td align='right'>{cashMap[d.name]}</td> }
                        </tr>)
                }
            </SortableTable>
        </ExpandableSection>
    )
}

export default CraftCollapsedList
