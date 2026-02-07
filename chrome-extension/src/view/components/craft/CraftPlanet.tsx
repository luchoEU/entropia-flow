import { useAtomValue, useSetAtom } from 'jotai'
import { activePlanetAtom, setCraftActivePlanetAtom } from '../../application/atoms/craft'
import React from 'react'

const CraftPlanet = () => {
    const activePlanet = useAtomValue(activePlanetAtom)
    const setCraftActivePlanet = useSetAtom(setCraftActivePlanetAtom)

    const validPlanets: string[] = []

    return (
        <div className='craft-planet'>
            <label title='Set your current planet to view available materials for this blueprint'>Planet</label>
            { validPlanets.length === 0 ?
                <span>{activePlanet ?? 'No valid planets'}</span> :
                <select value={activePlanet ?? ''} onChange={(e) => setCraftActivePlanet(e.target.value)}>
                    {validPlanets.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
            }
        </div>
    )
}

export default CraftPlanet
