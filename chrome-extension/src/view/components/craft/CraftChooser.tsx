import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { addBlueprint } from '../../application/actions/craft'
import { setOwnedBlueprintsExpanded } from '../../application/actions/inventory'
import { getCraft } from '../../application/selectors/craft'
import { getInventory } from '../../application/selectors/inventory'
import { CraftState } from '../../application/state/craft'
import { InventoryState } from '../../application/state/inventory'
import ExpandableSection from '../common/ExpandableSection'

function CraftChooser() {
    const inv: InventoryState = useSelector(getInventory)
    const s: CraftState = useSelector(getCraft)
    const dispatch = useDispatch()

    let bp = inv.blueprints.items.map(d => d.n)
    let added = s.blueprints.map(d => d.name)
    let unique = bp.filter((element, index) => {
        return bp.indexOf(element) === index && !added.includes(element);
    })

    return (
        <>
            <ExpandableSection title='Owned Blueprints' expanded={inv.blueprints.expanded} setExpanded={setOwnedBlueprintsExpanded}>
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
            </ExpandableSection>
        </>
    )
}

export default CraftChooser
