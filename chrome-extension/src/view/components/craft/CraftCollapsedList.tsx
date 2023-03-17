import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeBlueprint, setActiveBlueprintsExpanded, setBlueprintExpanded, sortBlueprintsBy } from '../../application/actions/craft'
import { BUDGET, CASH, CLICKS, ITEMS, NAME } from '../../application/helpers/craftSort'
import { getCraft } from '../../application/selectors/craft'
import { BlueprintData, CraftState } from '../../application/state/craft'
import ExpandableSection from '../common/ExpandableSection'

function CraftCollapsedList() {
    const s: CraftState = useSelector(getCraft)
    const dispatch = useDispatch()

    if (s.blueprints.length > 0) {
        var clicksMap = undefined
        var itemsMap = undefined
        var budgetMap = undefined
        var cashMap = undefined

        s.blueprints.forEach((d: BlueprintData) => {
            if (d.info.bpClicks > 0) {
                if (clicksMap === undefined)
                    clicksMap = {}
                clicksMap[d.name] = d.info.bpClicks
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

        const sortBy = (part: number) => () => dispatch(sortBlueprintsBy(part))

        return (
            <ExpandableSection title='Active Blueprints' expanded={s.activeBlueprintsExpanded} setExpanded={setActiveBlueprintsExpanded}>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            { clicksMap ? <th>Clicks</th> : <></> }
                            { itemsMap ? <th>Items</th> : <></> }
                            { budgetMap ? <th>Budget</th> : <></> }
                            { cashMap ? <th>Cash</th> : <></> }
                            <th>Remove</th>
                        </tr>
                    </thead>
                    <tbody>
                        {
                            s.blueprints.map((d: BlueprintData) =>
                                <tr key={d.name}>
                                    <td>
                                        {d.expanded ?
                                            <img src='img/down.png' onClick={() => dispatch(setBlueprintExpanded(d.name, false))} /> :
                                            <img src='img/up.png' onClick={() => dispatch(setBlueprintExpanded(d.name, true))} />}
                                    </td>
                                    <td onClick={sortBy(NAME)}>{d.itemName}</td>
                                    { clicksMap ? <td align='center' onClick={sortBy(CLICKS)}>{clicksMap[d.name]}</td> : <></> }
                                    { itemsMap ? <td align='center' onClick={sortBy(ITEMS)}>{itemsMap[d.name]}</td> : <></> }
                                    { budgetMap ? <td align='right' onClick={sortBy(BUDGET)}>{budgetMap[d.name]}</td> : <></> }
                                    { cashMap ? <td align='right' onClick={sortBy(CASH)}>{cashMap[d.name]}</td> : <></> }
                                    <td align='center'>
                                        <img src='img/cross.png' onClick={() => dispatch(removeBlueprint(d.name))} />
                                    </td>
                                </tr>)
                        }
                    </tbody>
                </table>
            </ExpandableSection>
        )
    } else {
        return <></>
    }
}

export default CraftCollapsedList
