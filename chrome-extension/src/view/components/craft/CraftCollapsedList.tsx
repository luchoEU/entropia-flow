import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { removeBlueprint, setBlueprintExpanded } from '../../application/actions/craft'
import { getCraft } from '../../application/selectors/craft'
import { BlueprintData, CraftState } from '../../application/state/craft'

function CraftCollapsedList() {
    const s: CraftState = useSelector(getCraft)
    const dispatch = useDispatch()

    function clicks(d: BlueprintData): number
    {
        const bp = d.info.materials.find(m => m.name === 'Blueprint')
        return bp?.clicks ?? Infinity
    }

    if (s.blueprints.length > 0) {
        return (
            <section>
                <h1>Active Blueprints</h1>
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>Name</th>
                            <th>Clicks</th>
                            <th>Budget</th>
                            <th>Cash</th>
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
                                    <td align='center'>{clicks(d)}</td>
                                    <td align='right'>
                                        { d.budget.total === undefined ? '' :
                                            d.budget.total.toFixed(2) + ' PED' }
                                    </td>
                                    <td align='right'>
                                        { d.budget.peds === undefined ? '' :
                                            d.budget.peds.toFixed(2) + ' PED' }
                                    </td>
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
