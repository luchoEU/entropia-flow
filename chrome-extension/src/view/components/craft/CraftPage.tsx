import React from 'react'
import CraftChooser from './CraftChooser'
import CraftCollapsedList from './CraftCollapsedList'
import CraftExpandedList from './CraftExpandedList'
import { useDispatch, useSelector } from 'react-redux'
import { getCraft } from '../../application/selectors/craft'
import { CraftState } from '../../application/state/craft'
import { setBlueprintActivePage } from '../../application/actions/craft'

const CraftBackToList = () => {
    const dispatch = useDispatch()

    return <section onClick={(e) => {
        e.stopPropagation();
        dispatch(setBlueprintActivePage(undefined))
    }}>
        <h1>{ 'List <<' }</h1>
    </section>
}

function CraftPage() {
    const state: CraftState = useSelector(getCraft)

    return state.activePage ?
        <>
            <CraftBackToList />
            <CraftExpandedList />
        </> :
        <>
            <CraftCollapsedList />
            <CraftChooser />
        </>
}

export default CraftPage
