import { useSelector } from "react-redux"
import { useDispatch } from "react-redux"
import { getCraft } from "../../application/selectors/craft"
import { getInventory } from "../../application/selectors/inventory"
import { setCraftActivePlanet } from "../../application/actions/craft"
import React from "react"

const CraftPlanet = () => {
    const { activePlanet } = useSelector(getCraft)
    const inv = useSelector(getInventory)
    const dispatch = useDispatch()

    return (
        <div className='craft-planet'>
            <label title='Set your current planet to view available materials for this blueprint'>Planet</label>
            { inv.byStore.c.validPlanets.length === 0 ?
                <span>{activePlanet ?? 'No valid planets'}</span> :
                <select value={activePlanet} onChange={(e) => dispatch(setCraftActivePlanet(e.target.value))}>
                    {inv.byStore.c.validPlanets.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
            }
        </div>
    )
}

export default CraftPlanet
