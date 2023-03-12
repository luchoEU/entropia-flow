import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeBlueprint, setBlueprintExpanded } from '../../application/actions/craft'
import { getCraft } from '../../application/selectors/craft'
import { BlueprintData, CraftState } from '../../application/state/craft'

function CraftCollapsedList() {
    const s: CraftState = useSelector(getCraft)
    const dispatch = useDispatch()

    if (s.blueprints.length > 0) {
        var clicksMap = undefined
        var budgetMap = undefined
        var cashMap = undefined

        s.blueprints.forEach((d: BlueprintData) => {
            if (d.info.materials.length > 0) {
                if (clicksMap === undefined )
                    clicksMap = {}
                const bp = d.info.materials.find(m => m.name === 'Blueprint')
                clicksMap[d.name] = bp?.clicks ?? Infinity
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

        return (
            <section>
                <h1>Active Blueprints</h1>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            { clicksMap ? <th>Clicks</th> : <></> }
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
                                            <img src='img/up.png' onClick={() => dispatch(setBlueprintExpanded(d.name, false))} /> :
                                            <img src='img/down.png' onClick={() => dispatch(setBlueprintExpanded(d.name, true))} />}
                                    </td>
                                    <td>{d.itemName}</td>
                                    { clicksMap ? <td align='center'>{clicksMap[d.name]}</td> : <></> }
                                    { budgetMap ? <td align='right'>{budgetMap[d.name]}</td> : <></> }
                                    { cashMap ? <td align='right'>{cashMap[d.name]}</td> : <></> }
                                    <td align='center'>
                                        <img src='img/cross.png' onClick={() => dispatch(removeBlueprint(d.name))} />
                                    </td>
                                </tr>)
                        }
                    </tbody>
                </table>
            </section>
        )
    } else {
        return <></>
    }
}

export default CraftCollapsedList
