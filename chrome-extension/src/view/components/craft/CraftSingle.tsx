import React from 'react'
import { useDispatch } from 'react-redux'
import { removeBlueprint, startBudgetPageLoading } from '../../application/actions/craft'
import { BlueprintData, BlueprintMaterial } from '../../application/state/craft'
import { StageText } from '../../services/api/sheets/sheetsStages'

function CraftSingle(p: {
    d: BlueprintData
}) {
    const { d } = p
    const dispatch = useDispatch()

    return (
        <>
            <section>
                <h1>{d.name} <img src='img/cross.png' onClick={() => dispatch(removeBlueprint(d.name))} /></h1>
                {
                    d.info.loading ?
                        <img className='img-loading' src='img/loading.gif' /> :
                    d.info.materials.length === 0 ?
                        <p>{d.info.errorText}</p> :
                        <div>                                
                            <a href={d.info.url} target="_blank">entropiawiki</a>
                            <p>{d.budget.loading ?
                                <>Loading Budget Page: <img className='img-loading' src='img/loading.gif' />{StageText[d.budget.stage]}...</> :
                                <button onClick={() => dispatch(startBudgetPageLoading(d.name))}>Load Budget Page</button>
                            }</p>
                            <p>Item: {d.itemName}</p>
                            <p>Item Value: {d.info.itemValue} PED</p>
                            <p>Available: {d.inventory.itemAvailable}</p>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Needed</th>
                                        <th>Unit Value</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Available</th>
                                        <th>Clicks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        d.info.materials.map((m: BlueprintMaterial) =>                                
                                            <tr key={m.name}>
                                                <td align="right">{m.quantity}</td>
                                                <td align="right">{m.value}</td>
                                                <td>{m.name}</td>
                                                <td>{m.type}</td>
                                                <td align="right">{m.available}</td>
                                                <td align="right">{m.clicks}</td>                                                
                                            </tr>)
                                    }
                                </tbody>
                            </table>
                            <p>Click TT Cost: {d.inventory.clickCost} PED</p>
                            <p>Residue Needed: {d.inventory.residueNeeded} PED</p>
                        </div>
                }
            </section>
        </>
    )
}

export default CraftSingle
