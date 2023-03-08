import React from 'react'
import { useDispatch } from 'react-redux'
import { removeBlueprint } from '../../application/actions/craft'
import { BlueprintData, BlueprintMaterial } from '../../application/state/craft'

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
                    d.loading ?
                        <img className='img-loading' src='img/loading.gif' /> :
                    d.materials.length === 0 ?
                        <p>{d.error}</p> :
                        <div>                                
                            <a href={d.url} target="_blank">entropiawiki</a>
                            <p>Item Value: {d.itemValue} PED</p>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Quantity</th>
                                        <th>Unit Value</th>
                                        <th>Name</th>
                                        <th>Type</th>
                                        <th>Available</th>
                                        <th>Clicks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        d.materials.map((m: BlueprintMaterial) =>                                
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
                        </div>
                }
            </section>
        </>
    )
}

export default CraftSingle
