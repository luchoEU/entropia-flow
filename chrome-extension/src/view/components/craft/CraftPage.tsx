import React from 'react'
import CraftChooser from './CraftChooser'
import CraftCollapsedList from './CraftCollapsedList'
import CraftExpandedList from './CraftExpandedList'
import { useDispatch, useSelector } from 'react-redux'
import { getCraft } from '../../application/selectors/craft'
import { setCraftActivePlanet } from '../../application/actions/craft'
import { getInventory } from '../../application/selectors/inventory'
import Back from '../common/Back'
import { useParams } from 'react-router-dom'
import { TabId } from '../../application/state/navigation'
import { formatUrlToBlueprint } from '../../application/helpers/navigation'

const CraftPlanet = () => {
    const { activePlanet } = useSelector(getCraft)
    const inv = useSelector(getInventory)
    const dispatch = useDispatch()

    return <section>
        <h1>Planet</h1>
        { inv.byStore.c.validPlanets.length > 0 ?
            <select value={activePlanet} onChange={(e) => dispatch(setCraftActivePlanet(e.target.value))}>
                {inv.byStore.c.validPlanets.map((p) => <option key={p} value={p}>{p}</option>)}
            </select> :
            (activePlanet ? <p>{activePlanet}</p> : <p>No valid planets</p>) 
        }
    </section>
}

function CraftPage() {
    const { bpName } = useParams()
    const bpNameDecoded = formatUrlToBlueprint(bpName)

    return bpNameDecoded ?
        <>
            <div className='flex'>
                <Back text='List' parentPage={TabId.CRAFT} />
                <CraftPlanet />
            </div>
            <CraftExpandedList bpName={bpNameDecoded} />
        </> :
        <>
            <CraftCollapsedList />
            <CraftChooser />
        </>
}

export default CraftPage
