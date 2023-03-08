import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addBlueprint } from '../../application/actions/craft'
import { getCraft } from '../../application/selectors/craft'
import { getInventory } from '../../application/selectors/inventory'
import { CraftState } from '../../application/state/craft'
import { InventoryState } from '../../application/state/inventory'

function CraftChooser() {
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
        </>
    )
}

export default CraftChooser
