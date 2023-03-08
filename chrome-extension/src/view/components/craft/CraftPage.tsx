import React from 'react'
import { useSelector } from 'react-redux'
import { getCraft } from '../../application/selectors/craft'
import { BlueprintData, CraftState } from '../../application/state/craft'
import CraftChooser from './CraftChooser'
import CraftSingle from './CraftSingle'

function CraftPage() {
    const s: CraftState = useSelector(getCraft)

    return (
        <>
            <CraftChooser />
            {
                s.blueprints.map((d: BlueprintData) => <CraftSingle key={d.name} d={d} />)
            }
        </>
    )
}

export default CraftPage
