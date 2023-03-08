import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { ItemData } from '../../../common/state'
import { addBlueprint } from '../../application/actions/craft'
import { getCraft } from '../../application/selectors/craft'
import { getInventory } from '../../application/selectors/inventory'
import { BlueprintData, BlueprintMaterial, CraftState } from '../../application/state/craft'
import { InventoryState } from '../../application/state/inventory'

function CraftPage() {
    const inv: InventoryState = useSelector(getInventory)
    const s: CraftState = useSelector(getCraft)
    const dispatch = useDispatch()

    let bp = inv.blueprints.map(d => d.n)
    let added = s.blueprints.map(d => d.name)
    let unique = bp.filter((element, index) => {
        return bp.indexOf(element) === index && !added.includes(element);
    })

    return (
        <>
            <section>
                <h1>Blueprint</h1>
                <select id="blueprintList">
                    {
                        unique.map((n: string) =>
                            <option key={n} value={n}>{n}</option>
                        )
                    }
                </select>
                <button
                        className='button-craft'
                        onClick={() => {
                            var e = document.getElementById("blueprintList") as HTMLSelectElement;
                            var name = e.value;
                            dispatch(addBlueprint(name))
                        }}>
                        Add
                </button>
            </section>
            {
                s.blueprints.map((d: BlueprintData) =>
                    <section key={d.name}>
                        <h1>{d.name}</h1>
                        {
                            d.loading ?
                                <img className='img-loading' src='img/loading.gif' /> :
                            d.materials.length === 0 ?
                                <p>{d.error}</p> :
                                <div>
                                    <a href={d.url} target="_blank">entropiawiki</a>
                                    <table>
                                        <tbody>
                                            {
                                                d.materials.map((m: BlueprintMaterial) =>                                
                                                    <tr key={m.name}>
                                                        <td>{m.quantity}</td>
                                                        <td>{m.name}</td>
                                                        <td>{m.available}</td>
                                                    </tr>)
                                            }
                                        </tbody>
                                    </table>
                                </div>
                        }
                    </section>
                )
            }
        </>
    )
}

export default CraftPage
