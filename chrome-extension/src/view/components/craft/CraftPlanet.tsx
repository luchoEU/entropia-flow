import { useAtomValue, useSetAtom } from 'jotai'
import { activePlanetAtom, setCraftActivePlanetAtom } from '../../application/atoms/craft'
import { inventoryStateAtom } from '../../application/atoms/inventory'
import React from 'react'
import { InventoryState } from '../../application/state/inventory'

const CraftPlanet = () => {
    const activePlanet = useAtomValue(activePlanetAtom)
    // Use Jotai computed atom instead of Redux selector
    const inv: InventoryState = useAtomValue(inventoryStateAtom)
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
