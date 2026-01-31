import { useSelector } from 'react-redux'
import { useAtomValue, useSetAtom } from 'jotai'
import { activePlanetAtom, setCraftActivePlanetAtom } from '../../application/atoms/craft'
import { getInventory } from '../../application/selectors/inventory'
import React from 'react'

const CraftPlanet = () => {
    const activePlanet = useAtomValue(activePlanetAtom)
    const inv = useSelector(getInventory)
    const setCraftActivePlanet = useSetAtom(setCraftActivePlanetAtom)

    return (
        <div className='craft-planet'>
            <label title='Set your current planet to view available materials for this blueprint'>Planet</label>
            { inv.byStore.c.validPlanets.length === 0 ?
                <span>{activePlanet ?? 'No valid planets'}</span> :
                <select value={activePlanet ?? ''} onChange={(e) => setCraftActivePlanet(e.target.value)}>
                    {inv.byStore.c.validPlanets.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
            }
        </div>
    )
}

export default CraftPlanet
