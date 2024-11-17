import React from 'react'
import CraftChooser from './CraftChooser'
import CraftCollapsedList from './CraftCollapsedList'
import CraftExpandedList from './CraftExpandedList'
import { useDispatch, useSelector } from 'react-redux'
import { getCraft } from '../../application/selectors/craft'
import { CraftState } from '../../application/state/craft'
import { setBlueprintActivePage, setCraftActivePlanet } from '../../application/actions/craft'
import { getInventory } from '../../application/selectors/inventory'

const CraftBackToList = () => {
    const dispatch = useDispatch()

    return <section className='pointer' onClick={(e) => {
        e.stopPropagation();
        dispatch(setBlueprintActivePage(undefined))
    }}>
        <h1>
            <span>List</span>
            <img src='img/left.png' />
        </h1>
    </section>
}

const CraftPlanet = () => {
    const { activePlanet } = useSelector(getCraft)
    const inv = useSelector(getInventory)
    const dispatch = useDispatch()

    return <section>
        <h1>Planet</h1>
        <select value={activePlanet} onChange={(e) => dispatch(setCraftActivePlanet(e.target.value))}>
            {inv.byStore.c.validPlanets.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
    </section>
}

function CraftPage() {
    const state: CraftState = useSelector(getCraft)

    return state.activePage ?
        <>
            <div className='flex'>
                <CraftBackToList />
                <CraftPlanet />
            </div>
            <CraftExpandedList />
        </> :
        <>
            <CraftCollapsedList />
            <CraftChooser />
        </>
}

export default CraftPage
